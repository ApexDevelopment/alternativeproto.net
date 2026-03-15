export type AuthType = "oauth" | "app-password" | "none";

export interface Project {
	id: string;
	slug: string;
	name: string;
	description: string;
	icon: string;
	iconUrl?: string;
	url: string;
	alternativeTo: string[];
	isOpenSource: boolean;
	authType: AuthType;
	repositoryUrl?: string;
	tags: string[];
}

export interface SubmissionData {
	name: string;
	description: string;
	icon: string;
	iconUrl?: string;
	url: string;
	alternativeTo: string[];
	isOpenSource: boolean;
	authType: AuthType;
	repositoryUrl?: string;
	tags: string[];
}

/**
 * A user review of a project.
 *
 * NSID: This maps to 'net.alternativeproto.review' lexicon.
 * Corresponds to the domain alternativeproto.net.
 */
export interface Review {
	projectId: string;
	rating: number; // 1-5
	text: string;
	isGoodAlternative: boolean;
	createdAt: string; // ISO datetime
}
