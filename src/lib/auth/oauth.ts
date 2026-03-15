/**
 * ATProto OAuth configuration and helpers
 */

// Import atproto lexicons for typed client operations
import type {} from "@atcute/atproto";

import {
	configureOAuth,
	createAuthorizationUrl,
	finalizeAuthorization,
	getSession,
	deleteStoredSession,
	OAuthUserAgent,
} from "@atcute/oauth-browser-client";
import { Client } from "@atcute/client";
import {
	CompositeDidDocumentResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	XrpcHandleResolver,
} from "@atcute/identity-resolver";

// Type for DID and Handle strings
type Did = `did:${string}:${string}`;
type Handle = `${string}.${string}`;

// PDS OAuth scope
const OAUTH_SCOPE = "atproto repo:net.alternativeproto.review";

// Storage keys
const SESSION_DID_KEY = "alternativeproto_session_did";
const SESSION_HANDLE_KEY = "alternativeproto_session_handle";

// NSID namespace for review records (alternativeproto.net)
export const REVIEW_COLLECTION = "net.alternativeproto.review";

// Get the base URL for OAuth configuration
function getBaseUrl(): string {
	return window.location.origin;
}

function isLoopback(): boolean {
	return (
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1"
	);
}

// Get loopback redirect URI using 127.0.0.1 (required by RFC 8252)
function getLoopbackRedirectUri(): string {
	const port = window.location.port;
	return `http://127.0.0.1:${port}/oauth/callback/`;
}

// Build OAuth client_id - uses loopback format for localhost, URL for production
function getClientId(): string {
	const baseUrl = getBaseUrl();

	if (isLoopback()) {
		const redirectUri = getLoopbackRedirectUri();
		return `http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(OAUTH_SCOPE)}`;
	}

	return `${baseUrl}/oauth-client-metadata.json`;
}

// Get the appropriate redirect URI based on environment
function getRedirectUri(): string {
	if (isLoopback()) {
		return getLoopbackRedirectUri();
	}
	return `${getBaseUrl()}/oauth/callback/`;
}

// Initialize OAuth configuration - call once at app startup
export function initializeOAuth(): void {
	configureOAuth({
		metadata: {
			client_id: getClientId(),
			redirect_uri: getRedirectUri(),
		},
		identityResolver: new LocalActorResolver({
			handleResolver: new XrpcHandleResolver({
				serviceUrl: "https://public.api.bsky.app",
			}),
			didDocumentResolver: new CompositeDidDocumentResolver({
				methods: {
					plc: new PlcDidDocumentResolver(),
					web: new WebDidDocumentResolver(),
				},
			}),
		}),
	});
}

// Check if we're on the OAuth callback route
export function isOAuthCallback(): boolean {
	return window.location.pathname.startsWith("/oauth/callback");
}

// Handle the OAuth callback
export async function handleOAuthCallback(): Promise<SessionInfo | null> {
	if (!isOAuthCallback()) {
		return null;
	}

	const params = new URLSearchParams(location.search);

	if (!params.has("state")) {
		const hashParams = new URLSearchParams(location.hash.slice(1));
		if (hashParams.has("state")) {
			params.set("state", hashParams.get("state")!);
			params.set("code", hashParams.get("code")!);
			params.set("iss", hashParams.get("iss")!);
		}
	}

	if (!params.has("state")) {
		console.error("No OAuth state found in callback URL");
		return null;
	}

	// Scrub params from URL to prevent replay attacks
	history.replaceState(null, "", "/");

	try {
		const { session } = await finalizeAuthorization(params);

		const did = session.info.sub;
		const handle =
			(session.info as any).handle ||
			localStorage.getItem(SESSION_HANDLE_KEY) ||
			did;

		localStorage.setItem(SESSION_DID_KEY, did);
		localStorage.setItem(SESSION_HANDLE_KEY, handle);

		return { did, handle };
	} catch (e) {
		console.error("OAuth callback error:", e);
		throw e;
	}
}

// Start the OAuth login flow
export async function login(handle: string): Promise<void> {
	localStorage.setItem(SESSION_HANDLE_KEY, handle);

	const authUrl = await createAuthorizationUrl({
		target: { type: "account", identifier: handle as Handle },
		scope: OAUTH_SCOPE,
	});

	await new Promise((resolve) => setTimeout(resolve, 200));
	window.location.assign(authUrl);
}

// Log out the current user
export function logout(): void {
	const did = localStorage.getItem(SESSION_DID_KEY) as Did | null;
	if (did) {
		try {
			deleteStoredSession(did);
		} catch (e) {
			console.warn("Error deleting session:", e);
		}
		localStorage.removeItem(SESSION_DID_KEY);
		localStorage.removeItem(SESSION_HANDLE_KEY);
	}
}

// Get the stored session DID
export function getStoredSessionDid(): Did | null {
	return localStorage.getItem(SESSION_DID_KEY) as Did | null;
}

// Session info exposed to the app
export interface SessionInfo {
	did: string;
	handle: string;
}

// Restore an existing session, returns null if no valid session
export async function restoreSession(): Promise<SessionInfo | null> {
	const did = getStoredSessionDid();
	if (!did) {
		return null;
	}

	try {
		const session = await getSession(did);
		const handle = localStorage.getItem(SESSION_HANDLE_KEY) || did;
		return {
			did: session.info.sub,
			handle: handle,
		};
	} catch (e) {
		console.warn("Failed to restore session:", e);
		localStorage.removeItem(SESSION_DID_KEY);
		localStorage.removeItem(SESSION_HANDLE_KEY);
		return null;
	}
}

// Validate the current session is still active
export async function validateSession(): Promise<SessionInfo | null> {
	const did = getStoredSessionDid();
	if (!did) {
		return null;
	}

	try {
		const session = await getSession(did);
		const handle = localStorage.getItem(SESSION_HANDLE_KEY) || did;
		return {
			did: session.info.sub,
			handle: handle,
		};
	} catch (e) {
		console.warn("Session validation failed:", e);
		localStorage.removeItem(SESSION_DID_KEY);
		localStorage.removeItem(SESSION_HANDLE_KEY);
		return null;
	}
}

// Get an authenticated RPC client for the current session
export async function getAuthenticatedClient(): Promise<Client | null> {
	const did = getStoredSessionDid();
	if (!did) {
		return null;
	}

	try {
		const session = await getSession(did);
		const agent = new OAuthUserAgent(session);
		return new Client({ handler: agent });
	} catch (e) {
		console.warn("Failed to get authenticated client:", e);
		return null;
	}
}

// Create a review record in the user's repository
export interface ReviewRecord {
	projectId: string;
	rating: number; // 1-5
	text: string;
	isGoodAlternative: boolean;
	createdAt: string;
}

export async function createReview(review: ReviewRecord): Promise<boolean> {
	const client = await getAuthenticatedClient();
	if (!client) {
		throw new Error("Your session has expired. Please sign in again.");
	}

	const did = getStoredSessionDid();
	if (!did) {
		throw new Error("Your session has expired. Please sign in again.");
	}

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
