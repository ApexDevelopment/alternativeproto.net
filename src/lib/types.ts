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

/** Shape of a submission record as stored in a user's PDS */
export interface SubmissionRecord {
	name: string;
	description: string;
	icon?: { ref: { $link: string }; mimeType: string; size: number };
	url: string;
	alternativeTo?: string[];
	isOpenSource?: boolean;
	authType: string;
	repositoryUrl?: string;
	tags?: string[];
	createdAt: string;
}

/** A submission record enriched with AT Protocol metadata */
export interface Submission {
	/** AT URI (at://did/collection/rkey) */
	uri: string;
	cid: string;
	/** DID of the submitter */
	did: string;
	/** Handle of the submitter */
	handle?: string;
	/** rkey portion of the AT URI */
	rkey: string;
	record: SubmissionRecord;
	/** Resolved icon URL (via PDS blob endpoint) */
	iconUrl?: string;
	/** Handle that attested this submission (handle matches URL hostname) */
	attestedBy?: string;
	/** Approval status based on labeler labels */
	approval?: "verified" | "community-verified";
}

export interface SubmissionData {
	name: string;
	description: string;
	iconFile?: File;
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
