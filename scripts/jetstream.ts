import {
	initDb,
	upsertSubmission,
	deleteSubmission,
	getCursor,
	setCursor,
	resolveIdentity,
	saveAdminVote,
	getAdminVote,
	deleteAdminVote,
	findOtherSubmissionsByUrl,
	getAdminUpvotesForSubject,
	hasLabelTransfer,
	recordLabelTransfer,
	cacheSubmissionIcon,
	upsertReview,
	deleteReview,
	REVIEW_COLLECTION_NAME,
} from "./db";
import { getLabelerInstance } from "./labeler-util";

const SUBMISSION_COLLECTION = "net.alternativeproto.submission";
const VOTE_COLLECTION = "net.alternativeproto.vote";
const VERIFIED_LABEL = "alternativeproto-verified";
const CURSOR_SAVE_INTERVAL = 5000;

let _started = false;

interface JetstreamEvent {
	did: string;
	time_us: number;
	kind: string;
	commit?: {
		rev: string;
		operation: "create" | "update" | "delete";
		collection: string;
		rkey: string;
		record?: Record<string, unknown>;
		cid?: string;
	};
}

async function handleVote(
	did: string,
	rkey: string,
	operation: "create" | "update" | "delete",
	record: Record<string, unknown> | undefined,
) {
	const adminDid = process.env.ADMIN_DID;
	if (!adminDid || did !== adminDid) return;

	const labeler = getLabelerInstance();
	if (!labeler) return;

	if (operation === "create" || operation === "update") {
		if (!record) return;
		const subject = record.subject as { uri?: string } | undefined;
		const direction = record.direction as string | undefined;
		if (!subject?.uri || !direction) return;

		await saveAdminVote(did, rkey, subject.uri, direction);

		if (direction === "up") {
			await labeler.createLabel({ val: VERIFIED_LABEL, uri: subject.uri });
			console.log(`[jetstream] Applied ${VERIFIED_LABEL} to ${subject.uri}`);
		}
	} else if (operation === "delete") {
		const vote = await getAdminVote(did, rkey);
		if (!vote) return;

		await deleteAdminVote(did, rkey);

		if (vote.direction === "up") {
			await labeler.createLabel({ val: VERIFIED_LABEL, uri: vote.subject_uri, neg: true });
			console.log(`[jetstream] Negated ${VERIFIED_LABEL} on ${vote.subject_uri}`);
		}
	}
}

/**
 * When an attested submission is indexed (handle matches URL), transfer any
 * existing labels from older submissions with the same URL.
 * Idempotent: skips transfers already recorded in label_transfers.
 */
export async function transferLabelsForClaim(
	newUri: string,
	handle: string | null,
	record: Record<string, unknown>,
) {
	if (!handle) return;

	const url = record.url as string | undefined;
	if (!url) return;

	// Only proceed if this submission is attested (handle matches URL)
	try {
		if (new URL(url).hostname.toLowerCase() !== handle.toLowerCase()) return;
	} catch {
		return;
	}

	const labeler = getLabelerInstance();
	if (!labeler) return;

	// Find other submissions with the same URL
	const others = await findOtherSubmissionsByUrl(url, newUri);

	for (const other of others) {
		// Check if the old submission has admin upvotes
		const upvotes = await getAdminUpvotesForSubject(other.uri);
		if (upvotes.length === 0) continue;

		// Transfer the label
		if (await hasLabelTransfer(other.uri, newUri, VERIFIED_LABEL)) continue;

		try {
			// Apply label to new URI
			await labeler.createLabel({ val: VERIFIED_LABEL, uri: newUri });
			// Negate label on old URI
			await labeler.createLabel({ val: VERIFIED_LABEL, uri: other.uri, neg: true });
			// Record transfer so we don't repeat it
			await recordLabelTransfer(other.uri, newUri, VERIFIED_LABEL);
			console.log(`[label-transfer] Transferred ${VERIFIED_LABEL} from ${other.uri} to ${newUri}`);
		} catch (e) {
			console.error(`[label-transfer] Failed to transfer label from ${other.uri} to ${newUri}:`, e);
		}
	}
}

export function startJetstream() {
	if (_started) return;
	_started = true;

	const jetstreamUrl = process.env.JETSTREAM_URL;
	if (!jetstreamUrl) {
		console.warn("[jetstream] JETSTREAM_URL not set, skipping");
		return;
	}

	let latestCursor: bigint | null = null;
	let cursorTimer: ReturnType<typeof setInterval> | null = null;
	let reconnectDelay = 1000;

	async function connect() {
		await initDb();

		const savedCursor = await getCursor();
		const params = new URLSearchParams();
		params.append("wantedCollections", SUBMISSION_COLLECTION);
		params.append("wantedCollections", VOTE_COLLECTION);
		params.append("wantedCollections", REVIEW_COLLECTION_NAME);
		if (savedCursor) {
			params.set("cursor", savedCursor.toString());
		}

		const url = `${jetstreamUrl}/subscribe?${params}`;
		console.log(`[jetstream] Connecting to ${url}`);

		const ws = new WebSocket(url);

		ws.onopen = () => {
			console.log("[jetstream] Connected");
			reconnectDelay = 1000;

			cursorTimer = setInterval(async () => {
				if (latestCursor !== null) {
					try {
						await setCursor(latestCursor);
					} catch (e) {
						console.error("[jetstream] Failed to save cursor:", e);
					}
				}
			}, CURSOR_SAVE_INTERVAL);
		};

		ws.onmessage = async (event) => {
			try {
				const raw =
					typeof event.data === "string"
						? event.data
						: new TextDecoder().decode(event.data as ArrayBuffer);
				const data: JetstreamEvent = JSON.parse(raw);

				latestCursor = BigInt(data.time_us);

				if (data.kind !== "commit" || !data.commit) return;

				const { collection, operation, rkey, record, cid, rev } = data.commit;
				const did = data.did;

				if (collection === SUBMISSION_COLLECTION) {
					const uri = `at://${did}/${SUBMISSION_COLLECTION}/${rkey}`;
					if (operation === "create" || operation === "update") {
						if (!record || !cid) return;
						try {
							const { pds, handle } = await resolveIdentity(did);
							await upsertSubmission(uri, did, rkey, cid, pds, handle, record, rev);
							console.log(`[jetstream] Indexed ${operation}: ${uri}`);								cacheSubmissionIcon(did, pds, record).catch((e) =>
									console.error(`[jetstream] Failed to cache icon for ${uri}:`, e),
								);							await transferLabelsForClaim(uri, handle, record);
						} catch (e) {
							console.error(`[jetstream] Failed to index ${uri}:`, e);
						}
					} else if (operation === "delete") {
						try {
							await deleteSubmission(uri);
							console.log(`[jetstream] Deleted: ${uri}`);
						} catch (e) {
							console.error(`[jetstream] Failed to delete ${uri}:`, e);
						}
					}
				} else if (collection === VOTE_COLLECTION) {
					await handleVote(did, rkey, operation, record);
				} else if (collection === REVIEW_COLLECTION_NAME) {
					if (operation === "create" || operation === "update") {
						if (!record) return;
						try {
							const { handle } = await resolveIdentity(did);
							await upsertReview(did, rkey, handle, record);
							console.log(`[jetstream] Indexed review ${operation}: at://${did}/${REVIEW_COLLECTION_NAME}/${rkey}`);
						} catch (e) {
							console.error(`[jetstream] Failed to index review at://${did}/${REVIEW_COLLECTION_NAME}/${rkey}:`, e);
						}
					} else if (operation === "delete") {
						try {
							await deleteReview(did, rkey);
							console.log(`[jetstream] Deleted review: at://${did}/${REVIEW_COLLECTION_NAME}/${rkey}`);
						} catch (e) {
							console.error(`[jetstream] Failed to delete review at://${did}/${REVIEW_COLLECTION_NAME}/${rkey}:`, e);
						}
					}
				}
			} catch (e) {
				console.error("[jetstream] Error processing message:", e);
			}
		};

		ws.onclose = () => {
			console.log(
				`[jetstream] Disconnected, reconnecting in ${reconnectDelay}ms`,
			);
			if (cursorTimer) clearInterval(cursorTimer);

			if (latestCursor !== null) {
				setCursor(latestCursor).catch(() => {});
			}

			setTimeout(connect, reconnectDelay);
			reconnectDelay = Math.min(reconnectDelay * 2, 30000);
		};

		ws.onerror = (error) => {
			console.error("[jetstream] WebSocket error:", error);
		};
	}

	connect().catch((e) => {
		console.error("[jetstream] Fatal error:", e);
		setTimeout(connect, reconnectDelay);
	});
}
