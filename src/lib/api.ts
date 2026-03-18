import type { SubmissionData, Submission, SubmissionRecord, DisplayReview } from "./types";
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

const VERIFIED_LABEL = "alternativeproto-verified";
const COMMUNITY_VERIFIED_LABEL = "alternativeproto-community-verified";

/** Fetch approval labels from the labeler for all submissions */
async function fetchApprovals(): Promise<Map<string, "verified" | "community-verified">> {
	const approvals = new Map<string, "verified" | "community-verified">();
	try {
		const params = new URLSearchParams();
		params.append("uriPatterns", "at://*");
		params.set("limit", "1000");
		const res = await fetch(`/xrpc/com.atproto.label.queryLabels?${params}`);
		if (!res.ok) return approvals;
		const data = await res.json();

		const verifiedUris = new Set<string>();
		const communityUris = new Set<string>();
		const negVerifiedUris = new Set<string>();
		const negCommunityUris = new Set<string>();

		for (const label of data.labels ?? []) {
			if (label.val === VERIFIED_LABEL) {
				if (label.neg) negVerifiedUris.add(label.uri);
				else verifiedUris.add(label.uri);
			} else if (label.val === COMMUNITY_VERIFIED_LABEL) {
				if (label.neg) negCommunityUris.add(label.uri);
				else communityUris.add(label.uri);
			}
		}
		for (const uri of verifiedUris) {
			if (!negVerifiedUris.has(uri)) approvals.set(uri, "verified");
		}
		for (const uri of communityUris) {
			if (!negCommunityUris.has(uri) && !approvals.has(uri)) {
				approvals.set(uri, "community-verified");
			}
		}
	} catch {
		// labeler unavailable — return empty map
	}
	return approvals;
}

/** Fetch all submissions from the backend database */
export async function listSubmissions(): Promise<Submission[]> {
	const [res, approvals] = await Promise.all([
		fetch("/api/submissions"),
		fetchApprovals(),
	]);
	if (!res.ok) {
		throw new Error(`Failed to fetch submissions: ${res.status}`);
	}
	const submissions: Submission[] = await res.json();
	for (const s of submissions) {
		const a = approvals.get(s.uri);
		if (a) s.approval = a;
	}

	// Sort by descending priority: attested > verified > community-verified > upvotes
	submissions.sort((a, b) => {
		const attestA = a.attestedBy ? 1 : 0;
		const attestB = b.attestedBy ? 1 : 0;
		if (attestA !== attestB) return attestB - attestA;

		const verifiedA = a.approval === "verified" ? 1 : 0;
		const verifiedB = b.approval === "verified" ? 1 : 0;
		if (verifiedA !== verifiedB) return verifiedB - verifiedA;

		const communityA = a.approval === "community-verified" ? 1 : 0;
		const communityB = b.approval === "community-verified" ? 1 : 0;
		if (communityA !== communityB) return communityB - communityA;

		return (b.upvotes ?? 0) - (a.upvotes ?? 0);
	});

	return submissions;
}

/** Fetch a single submission by DID + rkey from the backend database */
export async function getSubmission(
	did: string,
	rkey: string,
): Promise<Submission | null> {
	const [res, approvals] = await Promise.all([
		fetch(`/api/submissions/${encodeURIComponent(did)}/${encodeURIComponent(rkey)}`),
		fetchApprovals(),
	]);
	if (res.status === 404) return null;
	if (!res.ok) {
		throw new Error(`Failed to fetch submission: ${res.status}`);
	}
	const submission: Submission = await res.json();
	const a = approvals.get(submission.uri);
	if (a) submission.approval = a;
	return submission;
}

/** Fetch reviews for a submission from the backend */
export async function fetchReviews(did: string, rkey: string): Promise<DisplayReview[]> {
	const res = await fetch(`/api/reviews/${encodeURIComponent(did)}/${encodeURIComponent(rkey)}`);
	if (!res.ok) return [];
	return res.json();
}

export interface ReviewRecord {
	projectId: string;
	rating: number; // 1-5
	text: string;
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

export async function updateProject(
	rkey: string,
	data: SubmissionData,
	existingIconRef?: unknown,
): Promise<{ success: boolean; message: string }> {
	const { client, did } = await getClientAndDid();

	let iconBlobRef: unknown = existingIconRef;

	if (data.iconFile) {
		try {
			iconBlobRef = await uploadBlob(client, data.iconFile);
		} catch (e) {
			console.error("Failed to upload icon:", e);
			throw new Error("Failed to upload icon. Please try again.");
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
		const response = await client.post("com.atproto.repo.putRecord", {
			input: {
				repo: did,
				collection: SUBMISSION_COLLECTION,
				rkey,
				record,
			},
		});

		if (response.ok) {
			return {
				success: true,
				message: "Your submission has been updated!",
			};
		}

		return {
			success: false,
			message: "Failed to update submission. Please try again.",
		};
	} catch (e) {
		console.error("Failed to update project:", e);
		if (e instanceof Error && e.message.includes("auth")) {
			throw new Error("Your session has expired. Please sign in again.");
		}
		throw new Error("Failed to update project. Please try again.");
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

/** Look up the current user's existing vote for a submission URI from their PDS */
export async function getExistingVote(
	submissionUri: string,
): Promise<{ rkey: string; direction: VoteDirection } | null> {
	const did = getStoredSessionDid();
	if (!did) return null;

	const pdsUrl = await getPdsUrl(did);
	let cursor: string | undefined;

	do {
		const params = new URLSearchParams({
			repo: did,
			collection: VOTE_COLLECTION,
			limit: "100",
		});
		if (cursor) params.set("cursor", cursor);

		const res = await fetch(
			`${pdsUrl}/xrpc/com.atproto.repo.listRecords?${params}`,
		);
		if (!res.ok) return null;

		const data = await res.json();
		for (const item of data.records ?? []) {
			if (item.value?.subject?.uri === submissionUri) {
				const rkey = (item.uri as string).split("/").pop()!;
				return { rkey, direction: item.value.direction as VoteDirection };
			}
		}
		cursor = data.cursor;
	} while (cursor);

	return null;
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
