<script lang="ts">
	import { onMount } from "svelte";
	import {
		initializeOAuth,
		restoreSession,
		handleOAuthCallback,
		isOAuthCallback,
	} from "$lib/auth/oauth";
	import { session } from "$lib/stores/session";
	import { editingSubmission } from "$lib/stores/session";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { listSubmissions } from "$lib/api";
	import type { Submission } from "$lib/types";
	import {
		ArrowLeft,
		Plus,
	} from "lucide-svelte";
	import AuthButton from "$lib/components/AuthButton.svelte";
	import SubmitForm from "$lib/components/SubmitForm.svelte";
	import "../style.css";

	let { children } = $props();

	let showSubmitForm = $state(false);
	let editSub = $state<Submission | null>(null);
	let submissions = $state<Submission[]>([]);

	editingSubmission.subscribe((s) => {
		if (s) {
			editSub = s;
			showSubmitForm = true;
		}
	});
	let existingTags = $derived(
		[...new Set(submissions.flatMap((s) => s.record.tags ?? []))].sort(),
	);

	$effect(() => {
		// Track route for reactivity
		void page.url.pathname;
	});

	let isDetailView = $derived(page.url.pathname.startsWith("/project/"));

	onMount(async () => {
		initializeOAuth();

		// Fetch submissions for tag autocomplete
		listSubmissions()
			.then((s) => (submissions = s))
			.catch(() => {});

		let s = null;
		if (isOAuthCallback()) {
			try {
				s = await handleOAuthCallback();
				session.set(s);
				goto("/", { replaceState: true });
			} catch (e) {
				console.error("OAuth callback failed:", e);
				goto("/", { replaceState: true });
			}
		} else {
			s = await restoreSession();
			session.set(s);
		}

		// Ask the server to backfill this user's submissions
		if (s?.did) {
			fetch("/api/backfill", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ did: s.did }),
			}).catch(() => {});
		}
	});
</script>

<header class="site-header">
	<div class="header-content">
		<div class="logo-section">
			{#if isDetailView}
				<a href="/" class="back-link" aria-label="Back to catalog">
					<ArrowLeft size={24} strokeWidth={2} />
				</a>
			{:else}
				<span class="logo-icon"><img src="/logo.svg" alt="AlternativeProto" width={64} height={64} /></span>
			{/if}
			<div class="logo-text">
				<h1>
					{#if isDetailView}
						<a href="/" class="logo-link">AlternativeProto</a>
					{:else}
						AlternativeProto
					{/if}
				</h1>
				<p class="tagline">
					Decentralized alternatives to popular websites
				</p>
			</div>
		</div>
		<nav class="header-nav">
			<AuthButton currentSession={$session} />
			<button
				class="btn btn-primary"
				onclick={() => (showSubmitForm = true)}
			>
				<Plus size={18} strokeWidth={2.5} /> <span class="btn-label">Submit Project</span>
			</button>
		</nav>
	</div>
</header>

<main class="main-content">
	{@render children()}
</main>

<footer class="site-footer">
	<div class="footer-content">
		<p>
			<strong>AlternativeProto</strong> — A community-curated catalog of
			applications built on the
			<a href="https://atproto.com" target="_blank" rel="noopener noreferrer"
				>AT Protocol</a
			>
		</p>
	</div>
</footer>

{#if showSubmitForm}
	<SubmitForm
		onClose={() => { showSubmitForm = false; editSub = null; editingSubmission.set(null); }}
		existingTags={existingTags}
		existingSubmissions={submissions}
		editSubmission={editSub ?? undefined}
	/>
{/if}
