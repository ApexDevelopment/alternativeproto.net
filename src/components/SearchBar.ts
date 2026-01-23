import { getIconSvg } from "../utils/icons";

export interface SearchFilters {
	query: string;
	tag: string;
	alternativeTo: string;
	openSourceOnly: boolean;
}

export function createSearchBar(
	tags: string[],
	alternatives: string[],
	onFilterChange: (filters: SearchFilters) => void,
): HTMLElement {
	const container = document.createElement("div");
	container.className = "search-container";

	const tagOptions = tags
		.map((tag) => `<option value="${tag}">${tag}</option>`)
		.join("");
	const altOptions = alternatives
		.map((alt) => `<option value="${alt}">${alt}</option>`)
		.join("");

	container.innerHTML = `
		<div class="search-row">
		<div class="search-input-wrapper">
			<span class="search-icon">${getIconSvg("Search", 20, 2)}</span>
			<input 
			type="text" 
			id="search-input" 
			placeholder="Search projects by name, description, or tags..."
			class="search-input"
			/>
		</div>
		</div>
		<div class="filter-row">
		<div class="filter-group">
			<label for="tag-filter">Tag:</label>
			<select id="tag-filter" class="filter-select">
			<option value="">All Tags</option>
			${tagOptions}
			</select>
		</div>
		<div class="filter-group">
			<label for="alt-filter">Alternative to:</label>
			<select id="alt-filter" class="filter-select">
			<option value="">All Services</option>
			${altOptions}
			</select>
		</div>
		<div class="filter-group toggle-group">
			<span class="toggle-label-text">Open Source Only</span>
			<label class="toggle-switch toggle-switch-sm" for="opensource-filter">
				<input type="checkbox" id="opensource-filter" />
				<span class="toggle-slider"></span>
			</label>
		</div>
		</div>
	`;

	const searchInput =
		container.querySelector<HTMLInputElement>("#search-input")!;
	const tagFilter = container.querySelector<HTMLSelectElement>("#tag-filter")!;
	const altFilter = container.querySelector<HTMLSelectElement>("#alt-filter")!;
	const opensourceFilter =
		container.querySelector<HTMLInputElement>("#opensource-filter")!;

	const emitFilters = () => {
		onFilterChange({
			query: searchInput.value.toLowerCase().trim(),
			tag: tagFilter.value,
			alternativeTo: altFilter.value,
			openSourceOnly: opensourceFilter.checked,
		});
	};

	searchInput.addEventListener("input", emitFilters);
	tagFilter.addEventListener("change", emitFilters);
	altFilter.addEventListener("change", emitFilters);
	opensourceFilter.addEventListener("change", emitFilters);

	return container;
}
