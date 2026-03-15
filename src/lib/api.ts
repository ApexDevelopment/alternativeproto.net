import type { SubmissionData, Submission, SubmissionRecord } from "./types";
import {
	getAuthenticatedClient,
	getStoredSessionDid,
	REVIEW_COLLECTION,
	identityResolver,
} from "./auth/oauth";
import type { Client } from "@atcute/client";

export const SUBMISSION_COLLECTION = "net.alternativeproto.submission";
export const VOTE_COLLECTION = "net.alternativeproto.vote";

/** Resolve a DID or handle to its PDS service URL */
async function resolvePds(actor: string): Promise<string> {
	const resolved = await identityResolver.resolve(actor as any);
	return resolved.pds.replace(/\/+$/, "");
}

// Cache PDS URLs to avoid repeated resolution
const pdsCache = new Map<string, string>();
async function getPdsUrl(actor: string): Promise<string> {
	const cached = pdsCache.get(actor);
	if (cached) return cached;
	const pds = await resolvePds(actor);
	pdsCache.set(actor, pds);
	return pds;
}

export type VoteDirection = "up" | "down";

function parseAtUri(uri: string): { did: string; collection: string; rkey: string } {
	const match = uri.match(/^at:\/\/(did:[^/]+)\/([^/]+)\/([^/]+)$/);
	if (!match) throw new Error(`Invalid AT URI: ${uri}`);
	return { did: match[1], collection: match[2], rkey: match[3] };
}

function resolveIconUrl(pdsUrl: string, did: string, record: SubmissionRecord): string | undefined {
	if (!record.icon?.ref?.$link) return undefined;
	return `${pdsUrl}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(record.icon.ref.$link)}`;
}

function recordToSubmission(
	pdsUrl: string,
	uri: string,
	cid: string,
	value: SubmissionRecord,
): Submission {
	const { did, rkey } = parseAtUri(uri);
	return {
		uri,
		cid,
		did,
		rkey,
		record: value,
		iconUrl: resolveIconUrl(pdsUrl, did, value),
	};
}

/** Fetch all submissions from a specific repo (by DID or handle) */
export async function listSubmissions(repo: string): Promise<Submission[]> {
	const pdsUrl = await getPdsUrl(repo);
	const submissions: Submission[] = [];
	let cursor: string | undefined;

	do {
		const params = new URLSearchParams({
			repo,
			collection: SUBMISSION_COLLECTION,
			limit: "100",
		});
		if (cursor) params.set("cursor", cursor);

		const res = await fetch(
			`${pdsUrl}/xrpc/com.atproto.repo.listRecords?${params}`,
		);
		if (!res.ok) {
			console.error(`Failed to list submissions from ${repo}: ${res.status}`);
			break;
		}

		const data = await res.json();
		for (const item of data.records ?? []) {
			const record = item.value as SubmissionRecord;
			// Skip submissions without an icon — they won't be listed
			if (!record.icon) continue;
			submissions.push(recordToSubmission(pdsUrl, item.uri, item.cid, record));
		}
		cursor = data.cursor;
	} while (cursor);

	return submissions;
}

/** Fetch a single submission by repo + rkey */
export async function getSubmission(
	repo: string,
	rkey: string,
): Promise<Submission | null> {
	const pdsUrl = await getPdsUrl(repo);
	const params = new URLSearchParams({
		repo,
		collection: SUBMISSION_COLLECTION,
		rkey,
	});

	const res = await fetch(
		`${pdsUrl}/xrpc/com.atproto.repo.getRecord?${params}`,
	);
	if (!res.ok) return null;

	const data = await res.json();
	return recordToSubmission(pdsUrl, data.uri, data.cid, data.value as SubmissionRecord);
}

export interface ReviewRecord {
	projectId: string;
	rating: number; // 1-5
	text: string;
	isGoodAlternative: boolean;
	createdAt: string;
}

async function getClientAndDid() {
	const client = await getAuthenticatedClient();
	if (!client) {
		throw new Error("Your session has expired. Please sign in again.");
	}
	const did = getStoredSessionDid();
	if (!did) {
		throw new Error("Your session has expired. Please sign in again.");
	}
	return { client, did };
}

async function uploadBlob(
	client: Client,
	blob: Blob,
): Promise<unknown> {
	const response = await client.post("com.atproto.repo.uploadBlob", {
		input: blob,
		headers: { "content-type": blob.type || "application/octet-stream" },
	});

	if (response.ok && "blob" in response.data) {
		return response.data.blob;
	}
	throw new Error("Failed to upload blob");
}

async function fetchFavicon(projectUrl: string): Promise<Blob | null> {
	let origin: string;
	try {
		origin = new URL(projectUrl).origin;
	} catch {
		return null;
	}

	const candidates = [
		`${origin}/favicon.ico`,
		`${origin}/favicon.png`,
		`${origin}/apple-touch-icon.png`,
	];

	for (const url of candidates) {
		try {
			const response = await fetch(url, { mode: "cors" });
			if (!response.ok) continue;
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.startsWith("image/")) {
				return await response.blob();
			}
		} catch {
			continue;
		}
	}

	return null;
}

export async function createReview(review: ReviewRecord): Promise<boolean> {
	const { client, did } = await getClientAndDid();

	try {
		const response = await client.post("com.atproto.repo.createRecord", {
			input: {
				repo: did,
				collection: REVIEW_COLLECTION,
				record: {
					$type: REVIEW_COLLECTION,
					...review,
				},
			},
		});
		return response.ok;
	} catch (e) {
		console.error("Failed to create review:", e);
		if (e instanceof Error && e.message.includes("auth")) {
			throw new Error("Your session has expired. Please sign in again.");
		}
		throw new Error("Failed to submit review. Please try again.");
	}
}

export async function submitProject(
	data: SubmissionData,
): Promise<{ success: boolean; message: string }> {
	const { client, did } = await getClientAndDid();

	let iconBlobRef: unknown = undefined;

	if (data.iconFile) {
		try {
			iconBlobRef = await uploadBlob(client, data.iconFile);
		} catch (e) {
			console.error("Failed to upload icon:", e);
			throw new Error("Failed to upload icon. Please try again.");
		}
	} else {
		const favicon = await fetchFavicon(data.url);
		if (favicon) {
			try {
				iconBlobRef = await uploadBlob(client, favicon);
			} catch (e) {
				console.warn("Failed to upload fetched favicon:", e);
			}
		}
	}

	const record: Record<string, unknown> = {
		$type: SUBMISSION_COLLECTION,
		name: data.name,
		description: data.description,
		url: data.url,
		alternativeTo: data.alternativeTo,
		isOpenSource: data.isOpenSource,
		authType: data.authType,
		tags: data.tags,
		createdAt: new Date().toISOString(),
	};

	if (iconBlobRef) {
		record.icon = iconBlobRef;
	}

	if (data.repositoryUrl) {
		record.repositoryUrl = data.repositoryUrl;
	}

	try {
		const response = await client.post("com.atproto.repo.createRecord", {
			input: {
				repo: did,
				collection: SUBMISSION_COLLECTION,
				record,
			},
		});

		if (response.ok) {
			return {
				success: true,
				message: iconBlobRef
					? "Your submission has been received and is pending review. Thank you for contributing!"
					: "Your submission has been received but no icon could be found. The project won't be listed until an icon is added.",
			};
		}

		return {
			success: false,
			message: "Failed to create submission record. Please try again.",
		};
	} catch (e) {
		console.error("Failed to submit project:", e);
		if (e instanceof Error && e.message.includes("auth")) {
			throw new Error("Your session has expired. Please sign in again.");
		}
		throw new Error("Failed to submit project. Please try again.");
	}
}

export async function createVote(
	subjectUri: string,
	subjectCid: string,
	direction: VoteDirection,
): Promise<{ uri: string; cid: string }> {
	const { client, did } = await getClientAndDid();

	const response = await client.post("com.atproto.repo.createRecord", {
		input: {
			repo: did,
			collection: VOTE_COLLECTION,
			record: {
				$type: VOTE_COLLECTION,
				subject: {
					uri: subjectUri,
					cid: subjectCid,
				},
				direction,
				createdAt: new Date().toISOString(),
			},
		},
	});

	if (!response.ok) {
		throw new Error("Failed to cast vote. Please try again.");
	}

	return { uri: response.data.uri, cid: response.data.cid };
}

export async function deleteVote(rkey: string): Promise<void> {
	const { client, did } = await getClientAndDid();

	await client.post("com.atproto.repo.deleteRecord", {
		input: {
			repo: did,
			collection: VOTE_COLLECTION,
			rkey,
		},
	});
}
