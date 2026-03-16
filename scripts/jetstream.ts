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

				const { collection, operation, rkey, record, cid } = data.commit;
				const did = data.did;

				if (collection === SUBMISSION_COLLECTION) {
					const uri = `at://${did}/${SUBMISSION_COLLECTION}/${rkey}`;
					if (operation === "create" || operation === "update") {
						if (!record || !cid) return;
						try {
							const { pds, handle } = await resolveIdentity(did);
							await upsertSubmission(uri, did, rkey, cid, pds, handle, record);
							console.log(`[jetstream] Indexed ${operation}: ${uri}`);
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
