import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { startLabeler, DEFAULT_LABELER_PORT } from "./labeler-util";

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
		const proxyReq = require("node:http").request(
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
