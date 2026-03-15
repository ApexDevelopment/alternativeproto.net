import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
	const path = params.path;
	const didMatch = path.match(/^(did:[^/]+)\/([^/]+)$/);
	if (!didMatch) {
		return { did: null, rkey: null };
	}
	return { did: didMatch[1], rkey: didMatch[2] };
};
