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
	await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS handle TEXT`;
	await sql`
		CREATE TABLE IF NOT EXISTS jetstream_cursor (
			id INTEGER PRIMARY KEY DEFAULT 1,
			cursor_us BIGINT NOT NULL
		)
	`;
	await sql`
		CREATE TABLE IF NOT EXISTS admin_votes (
			did TEXT NOT NULL,
			rkey TEXT NOT NULL,
			subject_uri TEXT NOT NULL,
			direction TEXT NOT NULL,
			PRIMARY KEY (did, rkey)
		)
	`;
	await sql`
		CREATE TABLE IF NOT EXISTS label_transfers (
			from_uri TEXT NOT NULL,
			to_uri TEXT NOT NULL,
			label TEXT NOT NULL,
			PRIMARY KEY (from_uri, to_uri, label)
		)
	`;
	await sql`
		CREATE TABLE IF NOT EXISTS blob_cache (
			did TEXT NOT NULL,
			cid TEXT NOT NULL,
			mime_type TEXT NOT NULL,
			data BYTEA NOT NULL,
			cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			PRIMARY KEY (did, cid)
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

// ---------- Admin votes ----------

export async function saveAdminVote(
	did: string,
	rkey: string,
	subjectUri: string,
	direction: string,
) {
	const sql = getSql();
	await sql`
		INSERT INTO admin_votes (did, rkey, subject_uri, direction)
		VALUES (${did}, ${rkey}, ${subjectUri}, ${direction})
		ON CONFLICT (did, rkey) DO UPDATE SET
			subject_uri = EXCLUDED.subject_uri,
			direction = EXCLUDED.direction
	`;
}

export async function getAdminVote(
	did: string,
	rkey: string,
): Promise<{ subject_uri: string; direction: string } | null> {
	const sql = getSql();
	const rows = await sql<{ subject_uri: string; direction: string }[]>`
		SELECT subject_uri, direction FROM admin_votes WHERE did = ${did} AND rkey = ${rkey}
	`;
	return rows[0] ?? null;
}

export async function deleteAdminVote(did: string, rkey: string) {
	const sql = getSql();
	await sql`DELETE FROM admin_votes WHERE did = ${did} AND rkey = ${rkey}`;
}

/** Find all admin upvotes targeting a given submission URI */
export async function getAdminUpvotesForSubject(
	subjectUri: string,
): Promise<{ did: string; rkey: string; subject_uri: string; direction: string }[]> {
	const sql = getSql();
	return sql<{ did: string; rkey: string; subject_uri: string; direction: string }[]>`
		SELECT did, rkey, subject_uri, direction FROM admin_votes
		WHERE subject_uri = ${subjectUri} AND direction = 'up'
	`;
}

/** Find all submissions sharing a URL (excluding a specific URI) */
export async function findOtherSubmissionsByUrl(
	url: string,
	excludeUri: string,
): Promise<DbSubmission[]> {
	const sql = getSql();
	return sql<DbSubmission[]>`
		SELECT * FROM submissions
		WHERE record->>'url' = ${url} AND uri != ${excludeUri}
	`;
}

/** Check if a label transfer has already been recorded */
export async function hasLabelTransfer(
	fromUri: string,
	toUri: string,
	label: string,
): Promise<boolean> {
	const sql = getSql();
	const rows = await sql`
		SELECT 1 FROM label_transfers
		WHERE from_uri = ${fromUri} AND to_uri = ${toUri} AND label = ${label}
	`;
	return rows.length > 0;
}

/** Record a completed label transfer */
export async function recordLabelTransfer(
	fromUri: string,
	toUri: string,
	label: string,
) {
	const sql = getSql();
	await sql`
		INSERT INTO label_transfers (from_uri, to_uri, label)
		VALUES (${fromUri}, ${toUri}, ${label})
		ON CONFLICT DO NOTHING
	`;
}

// ---------- Blob cache ----------

export async function getCachedBlob(
	did: string,
	cid: string,
): Promise<{ mimeType: string; data: Buffer } | null> {
	const sql = getSql();
	const rows = await sql<{ mime_type: string; data: Buffer }[]>`
		SELECT mime_type, data FROM blob_cache WHERE did = ${did} AND cid = ${cid}
	`;
	if (!rows[0]) return null;
	return { mimeType: rows[0].mime_type, data: rows[0].data };
}

export async function cacheBlob(
	did: string,
	cid: string,
	mimeType: string,
	data: Buffer,
) {
	const sql = getSql();
	await sql`
		INSERT INTO blob_cache (did, cid, mime_type, data)
		VALUES (${did}, ${cid}, ${mimeType}, ${data})
		ON CONFLICT (did, cid) DO NOTHING
	`;
}

/**
 * Fetch a blob from a PDS and cache it locally.
 * Returns true if cached (or already cached), false on failure.
 */
export async function cacheBlobFromPds(
	did: string,
	cid: string,
	pdsUrl: string,
): Promise<boolean> {
	// Already cached?
	const existing = await getCachedBlob(did, cid);
	if (existing) return true;

	try {
		const url = `${pdsUrl}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
		const res = await fetch(url);
		if (!res.ok) return false;

		const mimeType = res.headers.get("content-type") || "application/octet-stream";
		const data = Buffer.from(await res.arrayBuffer());

		// Limit to 1 MB to match the lexicon constraint
		if (data.length > 1_000_000) return false;

		await cacheBlob(did, cid, mimeType, data);
		return true;
	} catch (e) {
		console.error(`[blob-cache] Failed to cache blob ${cid} for ${did}:`, e);
		return false;
	}
}

/** Cache the icon blob for a submission record, if it has one. */
export async function cacheSubmissionIcon(
	did: string,
	pdsUrl: string,
	record: Record<string, unknown>,
): Promise<void> {
	const icon = record.icon as
		| { ref: { $link: string }; mimeType: string }
		| undefined;
	if (!icon?.ref?.$link) return;
	await cacheBlobFromPds(did, icon.ref.$link, pdsUrl);
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
	onIndex?: (uri: string, handle: string | null, record: Record<string, unknown>) => Promise<void>,
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
				cacheSubmissionIcon(did, pdsUrl, item.value).catch((e) =>
					console.error(`[backfill] Failed to cache icon for ${uri}:`, e),
				);
				if (onIndex) {
					try {
						await onIndex(uri, handle, item.value);
					} catch (e) {
						console.error(`[backfill] onIndex callback error for ${uri}:`, e);
					}
				}
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
		iconUrl = `/api/blob/${encodeURIComponent(row.did)}/${encodeURIComponent(icon.ref.$link)}`;
	}

	const url = record.url as string | undefined;
	const attested =
		row.handle && url && handleMatchesUrl(row.handle, url)
			? row.handle
			: undefined;

	return {
		uri: row.uri,
		cid: row.cid,
		did: row.did,
		rkey: row.rkey,
		handle: row.handle ?? undefined,
		record,
		iconUrl,
		...(attested ? { attestedBy: attested } : {}),
	};
}
