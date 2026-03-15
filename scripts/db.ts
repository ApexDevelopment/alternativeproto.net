import postgres from "postgres";

const COLLECTION = "net.alternativeproto.submission";

let _sql: ReturnType<typeof postgres> | null = null;

export function getSql() {
	if (!_sql) {
		const url = process.env.DATABASE_URL;
		if (!url) throw new Error("DATABASE_URL environment variable is required");
		_sql = postgres(url);
	}
	return _sql;
}

export async function initDb() {
	const sql = getSql();
	await sql`
		CREATE TABLE IF NOT EXISTS submissions (
			uri TEXT PRIMARY KEY,
			did TEXT NOT NULL,
			rkey TEXT NOT NULL,
			cid TEXT NOT NULL,
			pds_url TEXT NOT NULL,
			handle TEXT,
			record JSONB NOT NULL,
			indexed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`;
	await sql`CREATE INDEX IF NOT EXISTS idx_submissions_did ON submissions(did)`;
	// Migration: add handle column if missing (existing installs)
	await sql`
		DO $$ BEGIN
			ALTER TABLE submissions ADD COLUMN handle TEXT;
		EXCEPTION WHEN duplicate_column THEN NULL;
		END $$
	`;
	await sql`
		CREATE TABLE IF NOT EXISTS jetstream_cursor (
			id INTEGER PRIMARY KEY DEFAULT 1,
			cursor_us BIGINT NOT NULL
		)
	`;
}

export interface DbSubmission {
	uri: string;
	did: string;
	rkey: string;
	cid: string;
	pds_url: string;
	handle: string | null;
	record: Record<string, unknown>;
	indexed_at: Date;
}

export async function upsertSubmission(
	uri: string,
	did: string,
	rkey: string,
	cid: string,
	pdsUrl: string,
	handle: string | null,
	record: Record<string, unknown>,
) {
	const sql = getSql();
	await sql`
		INSERT INTO submissions (uri, did, rkey, cid, pds_url, handle, record)
		VALUES (${uri}, ${did}, ${rkey}, ${cid}, ${pdsUrl}, ${handle}, ${sql.json(record)})
		ON CONFLICT (uri) DO UPDATE SET
			cid = EXCLUDED.cid,
			pds_url = EXCLUDED.pds_url,
			handle = EXCLUDED.handle,
			record = EXCLUDED.record,
			indexed_at = NOW()
	`;
}

export async function deleteSubmission(uri: string) {
	const sql = getSql();
	await sql`DELETE FROM submissions WHERE uri = ${uri}`;
}

/**
 * Return all submissions, deduplicating by URL.
 * When multiple submissions share the same URL, prefer the one whose
 * handle matches the URL hostname (i.e. the claimed/attested version).
 */
export async function getAllSubmissions(): Promise<DbSubmission[]> {
	const sql = getSql();
	const rows = await sql<DbSubmission[]>`SELECT * FROM submissions ORDER BY indexed_at DESC`;

	// Group by URL, pick attested version when available
	const byUrl = new Map<string, DbSubmission>();
	for (const row of rows) {
		const url = (row.record as Record<string, unknown>).url as string | undefined;
		if (!url) {
			// No URL — keep as-is (shouldn't happen, but safe)
			byUrl.set(row.uri, row);
			continue;
		}

		const existing = byUrl.get(url);
		if (!existing) {
			byUrl.set(url, row);
			continue;
		}

		// Prefer the submission whose handle matches the URL hostname
		if (row.handle && handleMatchesUrl(row.handle, url)) {
			byUrl.set(url, row);
		}
		// Otherwise keep the existing (first indexed / earlier)
	}

	return [...byUrl.values()];
}

function handleMatchesUrl(handle: string, url: string): boolean {
	try {
		return new URL(url).hostname.toLowerCase() === handle.toLowerCase();
	} catch {
		return false;
	}
}

export async function getSubmissionByDidRkey(
	did: string,
	rkey: string,
): Promise<DbSubmission | null> {
	const sql = getSql();
	const rows = await sql<DbSubmission[]>`
		SELECT * FROM submissions WHERE did = ${did} AND rkey = ${rkey}
	`;
	return rows[0] ?? null;
}

export async function getCursor(): Promise<bigint | null> {
	const sql = getSql();
	const rows = await sql<{ cursor_us: string }[]>`
		SELECT cursor_us FROM jetstream_cursor WHERE id = 1
	`;
	return rows[0] ? BigInt(rows[0].cursor_us) : null;
}

export async function setCursor(cursorUs: bigint) {
	const sql = getSql();
	await sql`
		INSERT INTO jetstream_cursor (id, cursor_us)
		VALUES (1, ${cursorUs.toString()})
		ON CONFLICT (id) DO UPDATE SET cursor_us = EXCLUDED.cursor_us
	`;
}

// ---------- PDS resolution (shared by jetstream + backfill) ----------

const identityCache = new Map<string, { pds: string; handle: string | null }>();

export async function resolveIdentity(
	did: string,
): Promise<{ pds: string; handle: string | null }> {
	const cached = identityCache.get(did);
	if (cached) return cached;

	let doc: {
		service?: Array<{ id: string; serviceEndpoint: string }>;
		alsoKnownAs?: string[];
	};

	if (did.startsWith("did:plc:")) {
		const res = await fetch(
			`https://plc.directory/${encodeURIComponent(did)}`,
		);
		if (!res.ok) throw new Error(`Failed to resolve ${did}: ${res.status}`);
		doc = await res.json();
	} else if (did.startsWith("did:web:")) {
		const domain = did.slice(8).replaceAll(":", "/");
		const res = await fetch(
			`https://${domain}/.well-known/did.json`,
		);
		if (!res.ok) throw new Error(`Failed to resolve ${did}: ${res.status}`);
		doc = await res.json();
	} else {
		throw new Error(`Unsupported DID method: ${did}`);
	}

	const svc = doc.service?.find((s) => s.id === "#atproto_pds");
	if (!svc?.serviceEndpoint) throw new Error(`No PDS service for ${did}`);

	const pds = svc.serviceEndpoint.replace(/\/+$/, "");
	const handle =
		doc.alsoKnownAs
			?.find((a) => a.startsWith("at://"))
			?.slice(5) ?? null;

	const result = { pds, handle };
	identityCache.set(did, result);
	return result;
}

export async function resolvePds(did: string): Promise<string> {
	return (await resolveIdentity(did)).pds;
}

// ---------- Backfill ----------

const backfillLastRun = new Map<string, number>();
const BACKFILL_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export async function backfillDid(
	did: string,
): Promise<{ status: "ok" | "rate-limited" | "error"; message: string }> {
	// Validate DID format
	if (!did.startsWith("did:")) {
		return { status: "error", message: "Invalid DID" };
	}

	const now = Date.now();
	const last = backfillLastRun.get(did);
	if (last && now - last < BACKFILL_COOLDOWN_MS) {
		const retryAfter = Math.ceil((BACKFILL_COOLDOWN_MS - (now - last)) / 1000);
		return {
			status: "rate-limited",
			message: `Rate limited. Try again in ${retryAfter}s.`,
		};
	}

	try {
		const { pds: pdsUrl, handle } = await resolveIdentity(did);
		let cursor: string | undefined;
		let count = 0;

		do {
			const params = new URLSearchParams({
				repo: did,
				collection: COLLECTION,
				limit: "100",
			});
			if (cursor) params.set("cursor", cursor);

			const res = await fetch(
				`${pdsUrl}/xrpc/com.atproto.repo.listRecords?${params}`,
			);
			if (!res.ok) {
				backfillLastRun.set(did, now);
				return {
					status: "error",
					message: `PDS returned ${res.status}`,
				};
			}

			const data = await res.json();
			for (const item of data.records ?? []) {
				const uri: string = item.uri;
				const rkey = uri.split("/").pop()!;
				await upsertSubmission(
					uri,
					did,
					rkey,
					item.cid,
					pdsUrl,
					handle,
					item.value,
				);
				count++;
			}
			cursor = data.cursor;
		} while (cursor);

		backfillLastRun.set(did, now);
		console.log(`[backfill] Indexed ${count} submissions for ${did}`);
		return { status: "ok", message: `Indexed ${count} submissions` };
	} catch (e) {
		console.error(`[backfill] Error for ${did}:`, e);
		backfillLastRun.set(did, now);
		return { status: "error", message: "Backfill failed" };
	}
}

export function dbRowToSubmission(row: DbSubmission) {
	const record = row.record as Record<string, unknown>;
	const icon = record.icon as
		| { ref: { $link: string }; mimeType: string }
		| undefined;
	let iconUrl: string | undefined;
	if (icon?.ref?.$link) {
		iconUrl = `${row.pds_url}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(row.did)}&cid=${encodeURIComponent(icon.ref.$link)}`;
	}
	return {
		uri: row.uri,
		cid: row.cid,
		did: row.did,
		rkey: row.rkey,
		record,
		iconUrl,
	};
}
