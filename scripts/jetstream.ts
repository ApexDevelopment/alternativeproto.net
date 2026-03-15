import {
	initDb,
	upsertSubmission,
	deleteSubmission,
	getCursor,
	setCursor,
	resolvePds,
} from "./db";

const COLLECTION = "net.alternativeproto.submission";
const CURSOR_SAVE_INTERVAL = 5000;

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

export function startJetstream() {
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
		const params = new URLSearchParams({
			wantedCollections: COLLECTION,
		});
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
				if (data.commit.collection !== COLLECTION) return;

				const { operation, rkey, record, cid } = data.commit;
				const did = data.did;
				const uri = `at://${did}/${COLLECTION}/${rkey}`;

				if (operation === "create" || operation === "update") {
					if (!record || !cid) return;
					try {
						const pdsUrl = await resolvePds(did);
						await upsertSubmission(uri, did, rkey, cid, pdsUrl, record);
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
