import { defineConfig } from "vite";

export default defineConfig({
	server: {
		// Use 127.0.0.1 instead of localhost for ATProto OAuth compatibility (RFC 8252)
		host: "127.0.0.1",
		port: 5173,
	},
	// Handle SPA routing - redirect /oauth/callback to index.html
	appType: "spa",
});
