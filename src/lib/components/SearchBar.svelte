<script lang="ts">
	import { Search } from "lucide-svelte";

	let {
		tags,
		alternatives,
		onFilterChange,
	}: {
		tags: string[];
		alternatives: string[];
		onFilterChange: (filters: SearchFilters) => void;
	} = $props();

	export interface SearchFilters {
		query: string;
		tag: string;
		alternativeTo: string;
		openSourceOnly: boolean;
	}

	let query = $state("");
	let tag = $state("");
	let alternativeTo = $state("");
	let openSourceOnly = $state(false);

	function emitFilters() {
		onFilterChange({
			query: query.toLowerCase().trim(),
			tag,
			alternativeTo,
			openSourceOnly,
		});
	}
</script>

<div class="search-container">
	<div class="search-row">
		<div class="search-input-wrapper">
			<span class="search-icon"><Search size={20} strokeWidth={2} /></span>
			<input
				type="text"
				placeholder="Search projects..."
				class="search-input"
				bind:value={query}
				oninput={emitFilters}
			/>
		</div>
	</div>
	<div class="filter-row">
		<div class="filter-group">
			<label for="tag-filter">Tag:</label>
			<select
				id="tag-filter"
				class="filter-select"
				bind:value={tag}
				onchange={emitFilters}
			>
				<option value="">All Tags</option>
				{#each tags as t}
					<option value={t}>{t}</option>
				{/each}
			</select>
		</div>
		<div class="filter-group">
			<label for="alt-filter">Alternative to:</label>
			<select
				id="alt-filter"
				class="filter-select"
				bind:value={alternativeTo}
				onchange={emitFilters}
			>
				<option value="">All Services</option>
				{#each alternatives as alt}
					<option value={alt}>{alt}</option>
				{/each}
			</select>
		</div>
		<div class="filter-group toggle-group">
			<span class="toggle-label-text">Open Source Only</span>
			<label class="toggle-switch toggle-switch-sm" for="opensource-filter">
				<input
					type="checkbox"
					id="opensource-filter"
					bind:checked={openSourceOnly}
					onchange={emitFilters}
				/>
				<span class="toggle-slider"></span>
			</label>
		</div>
	</div>
</div>
