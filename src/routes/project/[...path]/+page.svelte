<script lang="ts">
	import { getSubmission } from "$lib/api";
	import { session } from "$lib/stores/session";
	import { validateSession } from "$lib/auth/oauth";
	import { onMount } from "svelte";
	import ProjectDetail from "$lib/components/ProjectDetail.svelte";
	import { FileQuestionMark, ArrowLeft, LoaderCircle } from "lucide-svelte";
	import type { Submission } from "$lib/types";

	let { data } = $props();

	let submission = $state<Submission | null>(null);
	let loading = $state(true);

	onMount(async () => {
		if ($session) {
			const validated = await validateSession();
			session.set(validated);
		}

		if (data.did && data.rkey) {
			submission = await getSubmission(data.did, data.rkey);
		}
		loading = false;
	});
</script>

{#if loading}
	<div class="not-found">
		<LoaderCircle size={48} strokeWidth={1.5} class="spinning" />
		<p>Loading project...</p>
	</div>
{:else if submission}
	<ProjectDetail
		{submission}
		isSignedIn={$session !== null}
		sessionHandle={$session?.handle ?? ""}
		sessionDid={$session?.did ?? ""}
	/>
{:else}
	<div class="not-found">
		<span class="not-found-icon"><FileQuestionMark size={64} strokeWidth={1.5} /></span>
		<h2>Project not found</h2>
		<p>The project you're looking for doesn't exist.</p>
		<a href="/" class="btn btn-primary">
			<ArrowLeft size={18} strokeWidth={2} /> Back to catalog
		</a>
	</div>
{/if}
