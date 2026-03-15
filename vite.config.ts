import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { startLabeler, DEFAULT_LABELER_PORT } from "./scripts/labeler-util";

// Load .env into process.env so backend scripts can read them
Object.assign(process.env, loadEnv("development", process.cwd(), ""));

function labelerPlugin(): Plugin {
	return {
		name: "atproto-labeler",
		configureServer() {
			startLabeler();
		},
		config() {
			return {
				server: {
					proxy: {
						"/xrpc/com.atproto.label.queryLabels": {
							target: `http://127.0.0.1:${DEFAULT_LABELER_PORT}`,
							changeOrigin: true,
						},
						"/xrpc/com.atproto.label.subscribeLabels": {
							target: `http://127.0.0.1:${DEFAULT_LABELER_PORT}`,
							changeOrigin: true,
							ws: true,
						},
					},
				},
			};
		},
	};
}

function backendPlugin(): Plugin {
	return {
		name: "backend",
		async configureServer(server) {
			// Dynamic imports so these modules are only loaded during dev server
			const db = await import("./scripts/db");
			const { startJetstream } = await import("./scripts/jetstream");

			await db.initDb();
			startJetstream();

			// API middleware for dev
			server.middlewares.use(async (req, res, next) => {
				const url = new URL(req.url || "/", "http://localhost");

				if (url.pathname === "/api/submissions" && req.method === "GET") {
					try {
						const rows = await db.getAllSubmissions();
						const submissions = rows.map(db.dbRowToSubmission);
						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify(submissions));
					} catch (e) {
						console.error("API error:", e);
						res.statusCode = 500;
						res.end(JSON.stringify({ error: "Internal server error" }));
					}
					return;
				}

				const match = url.pathname.match(
					/^\/api\/submissions\/([^/]+)\/([^/]+)$/,
				);
				if (match && req.method === "GET") {
					const [, did, rkey] = match;
					try {
						const row = await db.getSubmissionByDidRkey(
							decodeURIComponent(did),
							decodeURIComponent(rkey),
						);
						if (!row) {
							res.statusCode = 404;
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify({ error: "Not found" }));
							return;
						}
						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify(db.dbRowToSubmission(row)));
					} catch (e) {
						console.error("API error:", e);
						res.statusCode = 500;
						res.end(JSON.stringify({ error: "Internal server error" }));
					}
					return;
				}

				if (url.pathname === "/api/backfill" && req.method === "POST") {
					let body = "";
					req.on("data", (chunk: string) => (body += chunk));
					req.on("end", async () => {
						try {
							const { did } = JSON.parse(body);
							if (!did || typeof did !== "string") {
								res.statusCode = 400;
								res.setHeader("Content-Type", "application/json");
								res.end(JSON.stringify({ error: "Missing did" }));
								return;
							}
							const result = await db.backfillDid(did);
							res.statusCode = result.status === "rate-limited" ? 429 : result.status === "ok" ? 200 : 500;
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify(result));
						} catch {
							res.statusCode = 400;
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify({ error: "Invalid request body" }));
						}
					});
					return;
				}

				next();
			});
		},
	};
}

export default defineConfig({
	plugins: [labelerPlugin(), backendPlugin(), sveltekit()],
	server: {
		// Use 127.0.0.1 instead of localhost for ATProto OAuth compatibility (RFC 8252)
		host: "127.0.0.1",
		port: 5173,
	},
});
