import { icons } from "lucide";

// Re-export for use in components
export { icons };

// Helper to render icon nodes recursively
function renderNode(node: unknown): string {
	if (!Array.isArray(node)) return "";
	const [tag, attrs, children] = node as [
		string,
		Record<string, string | number>,
		unknown[]?,
	];
	const attrString = Object.entries(attrs || {})
		.map(([key, value]) => `${key}="${value}"`)
		.join(" ");
	const childrenSvg = children ? children.map(renderNode).join("") : "";
	return childrenSvg
		? `<${tag} ${attrString}>${childrenSvg}</${tag}>`
		: `<${tag} ${attrString}/>`;
}

// Get SVG string for a specific icon
export function getIconSvg(
	name: keyof typeof icons,
	size: number = 24,
	strokeWidth: number = 2,
): string {
	const iconData = icons[name];
	if (!iconData) return "";

	// iconData is an array of nodes, each node is [tag, attrs, children?]
	const innerSvg = (iconData as unknown as unknown[]).map(renderNode).join("");

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${String(name).toLowerCase()}">${innerSvg}</svg>`;
}

// Icon name mappings for common UI elements
export const uiIcons = {
	search: "Search",
	plus: "Plus",
	x: "X",
	externalLink: "ExternalLink",
	github: "Github",
	lock: "Lock",
	unlock: "Unlock",
	key: "Key",
	squareAsterisk: "SquareAsterisk",
	user: "User",
	check: "Check",
	chevronDown: "ChevronDown",
	chevronUp: "ChevronUp",
} as const;
