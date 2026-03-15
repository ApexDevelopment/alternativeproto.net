import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";
import { startLabeler, DEFAULT_LABELER_PORT } from "./scripts/labeler-util";

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

export default defineConfig({
	plugins: [labelerPlugin(), sveltekit()],
	server: {
		// Use 127.0.0.1 instead of localhost for ATProto OAuth compatibility (RFC 8252)
		host: "127.0.0.1",
		port: 5173,
	},
});
