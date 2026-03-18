import { writable } from "svelte/store";
import type { SessionInfo } from "$lib/auth/oauth";
import type { Submission } from "$lib/types";

export const session = writable<SessionInfo | null>(null);

/** Set to a Submission to open the submit form in edit mode. Set to null to close. */
export const editingSubmission = writable<Submission | null>(null);
