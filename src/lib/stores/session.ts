import { writable } from "svelte/store";
import type { SessionInfo } from "$lib/auth/oauth";

export const session = writable<SessionInfo | null>(null);
