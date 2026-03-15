<script lang="ts">
	import { projects, getAllTags, getAllAlternatives } from "$lib/data";
	import type { Project } from "$lib/types";
	import ProjectCard from "$lib/components/ProjectCard.svelte";
	import SearchBar from "$lib/components/SearchBar.svelte";
	import type { SearchFilters } from "$lib/components/SearchBar.svelte";
	import { SearchX } from "lucide-svelte";

	let currentFilters = $state<SearchFilters>({
		query: "",
		tag: "",
		alternativeTo: "",
		openSourceOnly: false,
	});

	let filteredProjects = $derived.by(() => {
		const hasActiveFilters =
			currentFilters.query ||
			currentFilters.tag ||
			currentFilters.alternativeTo ||
			currentFilters.openSourceOnly;

		return projects.filter((project: Project) => {
			if (!hasActiveFilters && project.tags.includes("alternative-client")) {
				return false;
			}

			if (currentFilters.query) {
				const searchText = currentFilters.query;
				const matchesName = project.name.toLowerCase().includes(searchText);
				const matchesDescription = project.description
					.toLowerCase()
					.includes(searchText);
				const matchesTags = project.tags.some((tag) =>
					tag.toLowerCase().includes(searchText),
				);
				const matchesAlt = project.alternativeTo.some((alt) =>
					alt.toLowerCase().includes(searchText),
				);

				if (
					!matchesName &&
					!matchesDescription &&
					!matchesTags &&
					!matchesAlt
				) {
					return false;
				}
			}

			if (
				currentFilters.tag &&
				!project.tags.includes(currentFilters.tag)
			) {
				return false;
			}

			if (
				currentFilters.alternativeTo &&
				!project.alternativeTo.includes(currentFilters.alternativeTo)
			) {
				return false;
			}

			if (currentFilters.openSourceOnly && !project.isOpenSource) {
				return false;
			}

			return true;
		});
	});

	let resultsText = $derived.by(() => {
		const total = projects.length;
		const filtered = filteredProjects.length;
		if (filtered === total) {
			return `Showing all ${total} projects`;
		}
		return `Showing ${filtered} of ${total} projects`;
	});

	function handleFilterChange(filters: SearchFilters) {
		currentFilters = filters;
	}
</script>

<SearchBar
	tags={getAllTags()}
	alternatives={getAllAlternatives()}
	onFilterChange={handleFilterChange}
/>

<div class="results-count">{resultsText}</div>

<div class="projects-grid">
	{#if filteredProjects.length === 0}
		<div class="no-results">
			<span class="no-results-icon"><SearchX size={48} strokeWidth={1.5} /></span>
			<h3>No projects found</h3>
			<p>Try adjusting your search or filters</p>
		</div>
	{:else}
		{#each filteredProjects as project (project.id)}
			<ProjectCard {project} />
		{/each}
	{/if}
</div>
