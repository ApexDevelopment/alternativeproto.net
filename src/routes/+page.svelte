<script lang="ts">
	import { listSubmissions } from "$lib/api";
	import type { Submission } from "$lib/types";
	import ProjectCard from "$lib/components/ProjectCard.svelte";
	import SearchBar from "$lib/components/SearchBar.svelte";
	import type { SearchFilters } from "$lib/components/SearchBar.svelte";
	import { SearchX } from "lucide-svelte";
	import { onMount } from "svelte";
	import { session } from "$lib/stores/session";
	import { editingSubmission } from "$lib/stores/session";

	let submissions = $state<Submission[]>([]);

	onMount(async () => {
		try {
			submissions = await listSubmissions();
		} catch (e) {
			console.error("Failed to fetch submissions:", e);
		}
	});

	let currentFilters = $state<SearchFilters>({
		query: "",
		tag: "",
		alternativeTo: "",
		openSourceOnly: false,
	});

	let filteredSubmissions = $derived.by(() => {
		return submissions.filter((s) => {
			const r = s.record;
			const tags = r.tags ?? [];
			const alts = r.alternativeTo ?? [];

			if (currentFilters.query) {
				const q = currentFilters.query;
				const matchesName = r.name.toLowerCase().includes(q);
				const matchesDesc = r.description.toLowerCase().includes(q);
				const matchesTags = tags.some((t) => t.toLowerCase().includes(q));
				const matchesAlt = alts.some((a) => a.toLowerCase().includes(q));
				if (!matchesName && !matchesDesc && !matchesTags && !matchesAlt) {
					return false;
				}
			}

			if (currentFilters.tag && !tags.includes(currentFilters.tag)) {
				return false;
			}

			if (currentFilters.alternativeTo && !alts.includes(currentFilters.alternativeTo)) {
				return false;
			}

			if (currentFilters.openSourceOnly && !r.isOpenSource) {
				return false;
			}

			return true;
		});
	});

	let allTags = $derived(
		[...new Set(submissions.flatMap((s) => s.record.tags ?? []))].sort(),
	);
	let allAlternatives = $derived(
		[...new Set(submissions.flatMap((s) => s.record.alternativeTo ?? []))].sort(),
	);

	let resultsText = $derived.by(() => {
		const total = submissions.length;
		const filtered = filteredSubmissions.length;
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
	tags={allTags}
	alternatives={allAlternatives}
	onFilterChange={handleFilterChange}
/>

<div class="results-count">{resultsText}</div>

<div class="projects-grid">
	{#if filteredSubmissions.length === 0}
		<div class="no-results">
			<span class="no-results-icon"><SearchX size={48} strokeWidth={1.5} /></span>
			<h3>No projects found</h3>
			<p>Try adjusting your search or filters</p>
		</div>
	{:else}
		{#each filteredSubmissions as submission (submission.uri)}
			<ProjectCard
				{submission}
				sessionHandle={$session?.handle ?? ""}
				sessionDid={$session?.did ?? ""}
				onEdit={(s) => editingSubmission.set(s)}
			/>
		{/each}
	{/if}
</div>
