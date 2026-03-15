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

/** Fetch all submissions from the backend database */
export async function listSubmissions(): Promise<Submission[]> {
	const res = await fetch("/api/submissions");
	if (!res.ok) {
		throw new Error(`Failed to fetch submissions: ${res.status}`);
	}
	return res.json();
}

/** Fetch a single submission by DID + rkey from the backend database */
export async function getSubmission(
	did: string,
	rkey: string,
): Promise<Submission | null> {
	const res = await fetch(
		`/api/submissions/${encodeURIComponent(did)}/${encodeURIComponent(rkey)}`,
	);
	if (res.status === 404) return null;
	if (!res.ok) {
		throw new Error(`Failed to fetch submission: ${res.status}`);
	}
	return res.json();
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
					? "Your submission has been received, thank you for contributing!"
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

/** Check if a submission URL (sans scheme) matches a handle exactly */
export function urlMatchesHandle(submissionUrl: string, handle: string): boolean {
	try {
		const hostname = new URL(submissionUrl).hostname;
		return hostname.toLowerCase() === handle.toLowerCase();
	} catch {
		return false;
	}
}

/** Check if the given repo already has a submission whose URL matches */
export async function hasSubmissionWithUrl(
	repo: string,
	url: string,
): Promise<boolean> {
	const pdsUrl = await getPdsUrl(repo);
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
		if (!res.ok) break;

		const data = await res.json();
		for (const item of data.records ?? []) {
			const record = item.value as SubmissionRecord;
			if (record.url === url) return true;
		}
		cursor = data.cursor;
	} while (cursor);

	return false;
}

/** Copy a submission record to the logged-in user's PDS */
export async function claimSubmission(
	submission: Submission,
): Promise<{ success: boolean; message: string }> {
	const { client, did } = await getClientAndDid();
	const srcRecord = submission.record;

	// Re-upload the icon blob to the user's own PDS
	let iconBlobRef: unknown = undefined;
	if (submission.iconUrl) {
		try {
			const res = await fetch(submission.iconUrl);
			if (res.ok) {
				const blob = await res.blob();
				iconBlobRef = await uploadBlob(client, blob);
			}
		} catch (e) {
			console.warn("Failed to re-upload icon for claim:", e);
		}
	}

	const record: Record<string, unknown> = {
		$type: SUBMISSION_COLLECTION,
		name: srcRecord.name,
		description: srcRecord.description,
		url: srcRecord.url,
		alternativeTo: srcRecord.alternativeTo ?? [],
		isOpenSource: srcRecord.isOpenSource ?? false,
		authType: srcRecord.authType,
		tags: srcRecord.tags ?? [],
		createdAt: new Date().toISOString(),
	};

	if (iconBlobRef) {
		record.icon = iconBlobRef;
	}

	if (srcRecord.repositoryUrl) {
		record.repositoryUrl = srcRecord.repositoryUrl;
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
				message: "Project claimed successfully! It is now attested under your account.",
			};
		}

		return { success: false, message: "Failed to claim project. Please try again." };
	} catch (e) {
		console.error("Failed to claim submission:", e);
		if (e instanceof Error && e.message.includes("auth")) {
			throw new Error("Your session has expired. Please sign in again.");
		}
		throw new Error("Failed to claim project. Please try again.");
	}
}
