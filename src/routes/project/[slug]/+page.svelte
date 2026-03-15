<script lang="ts">
	import { getProjectBySlug } from "$lib/data";
	import { session } from "$lib/stores/session";
	import { validateSession } from "$lib/auth/oauth";
	import { onMount } from "svelte";
	import ProjectDetail from "$lib/components/ProjectDetail.svelte";
	import { FileQuestion, ArrowLeft } from "lucide-svelte";

	let { data } = $props();

	// slug comes from route param; doesn't change for this page instance
	const project = getProjectBySlug(data.slug); // eslint-disable-line

	onMount(async () => {
		// Validate session when viewing project detail (for review form)
		if ($session) {
			const validated = await validateSession();
			session.set(validated);
		}
	});
</script>

{#if project}
	<ProjectDetail {project} isSignedIn={$session !== null} />
{:else}
	<div class="not-found">
		<span class="not-found-icon"><FileQuestion size={64} strokeWidth={1.5} /></span>
		<h2>Project not found</h2>
		<p>The project you're looking for doesn't exist.</p>
		<a href="/" class="btn btn-primary">
			<ArrowLeft size={18} strokeWidth={2} /> Back to catalog
		</a>
	</div>
{/if}
