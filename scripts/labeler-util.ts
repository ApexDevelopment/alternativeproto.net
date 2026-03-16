import { LabelerServer } from "@skyware/labeler";

export const DEFAULT_LABELER_PORT = 14831;

let _instance: LabelerServer | null = null;

/** Returns the running labeler instance, or null if disabled. */
export function getLabelerInstance(): LabelerServer | null {
	return _instance;
}

export function startLabeler(
	port = DEFAULT_LABELER_PORT,
): LabelerServer | null {
	const did = process.env.LABELER_DID;
	const signingKey = process.env.SIGNING_KEY;

	if (!did || !signingKey) {
		console.log(
			"[labeler] LABELER_DID / SIGNING_KEY not set — labeler disabled",
		);
		return null;
	}

	const labeler = new LabelerServer({ did, signingKey });
	labeler.start(port, (error) => {
		if (error) {
			console.error("[labeler] Failed to start:", error);
		} else {
			console.log(`[labeler] Running on internal port ${port}`);
		}
	});

	_instance = labeler;
	return labeler;
}
