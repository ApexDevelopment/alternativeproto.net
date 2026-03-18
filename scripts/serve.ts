import { createServer, request as httpRequest } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { startLabeler, DEFAULT_LABELER_PORT } from "./labeler-util";
import { initDb, getAllSubmissionsRanked, getSubmissionByDidRkey, dbRowToSubmission, backfillDid, getCachedBlob, cacheBlobFromPds, resolvePds, backfillFromRelay, getReviewsForSubmission, SUBMISSION_COLLECTION } from "./db";
import { transferLabelsForClaim } from "./jetstream";
import { startJetstream } from "./jetstream";

const PORT = parseInt(process.env.PORT || "3000", 10);
const LABELER_PORT = parseInt(
	process.env.LABELER_PORT || String(DEFAULT_LABELER_PORT),
	10,
);
const STATIC_DIR = join(import.meta.dirname, "..", "build");

const labeler = startLabeler(LABELER_PORT);
if (!labeler) {
	console.error(
		"Missing required environment variables: LABELER_DID, SIGNING_KEY",
	);
	process.exit(1);
}

// Initialize database and start Jetstream consumer
await initDb();
startJetstream();

// Relay backfill (runs in background)
const relayUrl = process.env.RELAY_URL;
if (relayUrl) {
	backfillFromRelay(relayUrl, transferLabelsForClaim).catch((e) =>
		console.error("[relay-backfill] Unhandled error:", e),
	);
}

const MIME_TYPES: Record<string, string> = {
	".html": "text/html; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".webp": "image/webp",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".txt": "text/plain; charset=utf-8",
};

async function serveStatic(
	pathname: string,
): Promise<{ body: Buffer; contentType: string } | null> {
	const filePath = join(STATIC_DIR, pathname);

	// Prevent directory traversal
	if (!filePath.startsWith(STATIC_DIR)) return null;

	try {
		const info = await stat(filePath);
		if (!info.isFile()) return null;
		const body = await readFile(filePath);
		const ext = extname(filePath);
		const contentType = MIME_TYPES[ext] || "application/octet-stream";
		return { body, contentType };
	} catch {
		return null;
	}
}

const server = createServer(async (req, res) => {
	const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
	const pathname = decodeURIComponent(url.pathname);

	// API: list all submissions
	if (pathname === "/api/submissions" && req.method === "GET") {
		try {
			const submissions = await getAllSubmissionsRanked();
			res.writeHead(200, {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			});
			res.end(JSON.stringify(submissions));
		} catch (e) {
			console.error("API error (list submissions):", e);
			res.writeHead(500, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "Internal server error" }));
		}
		return;
	}

	// API: get single submission by did/rkey
	const submissionMatch = pathname.match(
		/^\/api\/submissions\/([^/]+)\/([^/]+)$/,
	);
	if (submissionMatch && req.method === "GET") {
		const [, did, rkey] = submissionMatch;
		try {
			const row = await getSubmissionByDidRkey(
				decodeURIComponent(did),
				decodeURIComponent(rkey),
			);
			if (!row) {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Not found" }));
				return;
			}
			res.writeHead(200, {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			});
			res.end(JSON.stringify(dbRowToSubmission(row)));
		} catch (e) {
			console.error("API error (get submission):", e);
			res.writeHead(500, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "Internal server error" }));
		}
		return;
	}

	// API: backfill a user's submissions from their PDS
	if (pathname === "/api/backfill" && req.method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", async () => {
			try {
				const { did } = JSON.parse(body);
				if (!did || typeof did !== "string") {
					res.writeHead(400, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: "Missing did" }));
					return;
				}
				const result = await backfillDid(did, transferLabelsForClaim);
				const status = result.status === "rate-limited" ? 429 : result.status === "ok" ? 200 : 500;
				res.writeHead(status, { "Content-Type": "application/json" });
				res.end(JSON.stringify(result));
			} catch {
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Invalid request body" }));
			}
		});
		return;
	}

	// API: fetch reviews for a submission
	const reviewsMatch = pathname.match(
		/^\/api\/reviews\/([^/]+)\/([^/]+)$/,
	);
	if (reviewsMatch && req.method === "GET") {
		const [, reviewDid, reviewRkey] = reviewsMatch;
		const subjectUri = `at://${decodeURIComponent(reviewDid)}/${SUBMISSION_COLLECTION}/${decodeURIComponent(reviewRkey)}`;
		try {
			const reviews = await getReviewsForSubmission(subjectUri);
			res.writeHead(200, {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			});
			res.end(JSON.stringify(reviews));
		} catch (e) {
			console.error("API error (reviews):", e);
			res.writeHead(500, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "Internal server error" }));
		}
		return;
	}

	// API: proxy favicon fetch (avoids CORS issues on client)
	if (pathname === "/api/favicon" && req.method === "GET") {
		const targetUrl = url.searchParams.get("url");
		if (!targetUrl) {
			res.writeHead(400, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "Missing url parameter" }));
			return;
		}

		let origin: string;
		try {
			const parsed = new URL(targetUrl);
			if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
				res.writeHead(400);
				res.end("Invalid URL scheme");
				return;
			}
			origin = parsed.origin;
		} catch {
			res.writeHead(400);
			res.end("Invalid URL");
			return;
		}

		const candidates = [
			`${origin}/favicon.ico`,
			`${origin}/favicon.png`,
			`${origin}/apple-touch-icon.png`,
		];

		for (const candidate of candidates) {
			try {
				const faviconRes = await fetch(candidate, {
					headers: { "User-Agent": "alternativeproto/1.0 (+https://alternativeproto.net)" },
					redirect: "follow",
					signal: AbortSignal.timeout(5000),
				});
				if (!faviconRes.ok) continue;
				const ct = faviconRes.headers.get("content-type");
				if (!ct || !ct.startsWith("image/")) continue;
				const data = Buffer.from(await faviconRes.arrayBuffer());
				if (data.length === 0 || data.length > 1_000_000) continue;
				res.writeHead(200, { "Content-Type": ct });
				res.end(data);
				return;
			} catch {
				continue;
			}
		}

		res.writeHead(404);
		res.end("No favicon found");
		return;
	}

	// API: serve cached blobs (proxy)
	const blobMatch = pathname.match(/^\/api\/blob\/([^/]+)\/([^/]+)$/);
	if (blobMatch && req.method === "GET") {
		const [, blobDid, blobCid] = blobMatch;
		const did = decodeURIComponent(blobDid);
		const cid = decodeURIComponent(blobCid);
		try {
			let cached = await getCachedBlob(did, cid);
			if (!cached) {
				// Try to fetch and cache on-demand
				const pds = await resolvePds(did);
				await cacheBlobFromPds(did, cid, pds);
				cached = await getCachedBlob(did, cid);
			}
			if (!cached) {
				res.writeHead(404);
				res.end("Not Found");
				return;
			}
			res.writeHead(200, {
				"Content-Type": cached.mimeType,
				"Cache-Control": "public, max-age=31536000, immutable",
				"Access-Control-Allow-Origin": "*",
			});
			res.end(cached.data);
		} catch (e) {
			console.error("API error (blob):", e);
			res.writeHead(500);
			res.end("Internal server error");
		}
		return;
	}

	// Proxy labeler XRPC endpoints
	if (
		pathname === "/xrpc/com.atproto.label.queryLabels" ||
		pathname === "/xrpc/com.atproto.label.subscribeLabels"
	) {
		const proxyUrl = `http://127.0.0.1:${LABELER_PORT}${url.pathname}${url.search}`;
		try {
			const proxyRes = await fetch(proxyUrl, {
				method: req.method,
				headers: req.headers as Record<string, string>,
			});
			res.writeHead(proxyRes.status, Object.fromEntries(proxyRes.headers));
			const body = Buffer.from(await proxyRes.arrayBuffer());
			res.end(body);
		} catch (e) {
			res.writeHead(502, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ error: "Labeler unavailable" }));
		}
		return;
	}

	// Dynamic OAuth client metadata (uses PUBLIC_URL for production)
	if (pathname === "/oauth-client-metadata.json" && req.method === "GET") {
		const publicUrl = process.env.PUBLIC_URL;
		if (publicUrl) {
			const metadata = {
				client_id: `${publicUrl}/oauth-client-metadata.json`,
				client_name: "AlternativeProto",
				client_uri: publicUrl,
				logo_uri: `${publicUrl}/icons/logo.png`,
				redirect_uris: [`${publicUrl}/oauth/callback/`],
				scope: "atproto blob:*/* repo:net.alternativeproto.review repo:net.alternativeproto.submission repo:net.alternativeproto.vote",
				grant_types: ["authorization_code", "refresh_token"],
				response_types: ["code"],
				application_type: "web",
				dpop_bound_access_tokens: true,
				token_endpoint_auth_method: "none",
			};
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify(metadata, null, "\t"));
			return;
		}
		// Fall through to static file if PUBLIC_URL not set
	}

	// Try to serve static file
	const result =
		(await serveStatic(pathname)) ||
		(pathname.endsWith("/")
			? await serveStatic(pathname + "index.html")
			: null);

	if (result) {
		res.writeHead(200, { "Content-Type": result.contentType });
		res.end(result.body);
		return;
	}

	// SPA fallback
	const fallback = await serveStatic("/index.html");
	if (fallback) {
		res.writeHead(200, { "Content-Type": fallback.contentType });
		res.end(fallback.body);
		return;
	}

	res.writeHead(404);
	res.end("Not Found");
});

server.on("upgrade", (req, socket, head) => {
	const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
	if (url.pathname === "/xrpc/com.atproto.label.subscribeLabels") {
		const proxyUrl = `http://127.0.0.1:${LABELER_PORT}${url.pathname}${url.search}`;
		const proxyReq = httpRequest(
			proxyUrl,
			{ method: "GET", headers: req.headers },
			() => {},
		);
		proxyReq.on("upgrade", (_: unknown, proxySocket: import("node:net").Socket, proxyHead: Buffer) => {
			socket.write(
				"HTTP/1.1 101 Switching Protocols\r\n" +
					"Upgrade: websocket\r\n" +
					"Connection: Upgrade\r\n" +
					"\r\n",
			);
			if (proxyHead.length) socket.write(proxyHead);
			proxySocket.pipe(socket);
			socket.pipe(proxySocket);
		});
		proxyReq.on("error", () => socket.destroy());
		proxyReq.end();
	} else {
		socket.destroy();
	}
});

server.listen(PORT, "0.0.0.0", () => {
	console.log(`[server] Listening on port ${PORT}`);
});
