import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";

const LABELER_PORT = 14831;

function labelerPlugin(): Plugin {
	return {
		name: "atproto-labeler",
		async configureServer(server) {
			const did = process.env.LABELER_DID;
			const signingKey = process.env.SIGNING_KEY;
			if (!did || !signingKey) {
				console.log(
					"[labeler] LABELER_DID / SIGNING_KEY not set — labeler proxy disabled",
				);
				return;
			}

			const { LabelerServer } = await import("@skyware/labeler");
			const labeler = new LabelerServer({ did, signingKey });
			labeler.start(LABELER_PORT, (error) => {
				if (error) {
					console.error("[labeler] Failed to start:", error);
				} else {
					console.log(
						`[labeler] Running on internal port ${LABELER_PORT}`,
					);
				}
			});
		},
		config() {
			return {
				server: {
					proxy: {
						"/xrpc/com.atproto.label.queryLabels": {
							target: `http://127.0.0.1:${LABELER_PORT}`,
							changeOrigin: true,
						},
						"/xrpc/com.atproto.label.subscribeLabels": {
							target: `http://127.0.0.1:${LABELER_PORT}`,
							changeOrigin: true,
							ws: true,
						},
					},
				},
			};
		},
	};
}

export default defineConfig({
	plugins: [labelerPlugin(), sveltekit()],
	server: {
		// Use 127.0.0.1 instead of localhost for ATProto OAuth compatibility (RFC 8252)
		host: "127.0.0.1",
		port: 5173,
	},
});
