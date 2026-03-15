<script lang="ts">
	import { onMount } from "svelte";
	import {
		initializeOAuth,
		restoreSession,
		handleOAuthCallback,
		isOAuthCallback,
	} from "$lib/auth/oauth";
	import { session } from "$lib/stores/session";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { getAllTags } from "$lib/data";
	import {
		ArrowLeft,
		Hexagon,
		Plus,
	} from "lucide-svelte";
	import AuthButton from "$lib/components/AuthButton.svelte";
	import SubmitForm from "$lib/components/SubmitForm.svelte";
	import "../style.css";

	let { children } = $props();

	let showSubmitForm = $state(false);

	$effect(() => {
		// Track route for reactivity
		void page.url.pathname;
	});

	let isDetailView = $derived(page.url.pathname.startsWith("/project/"));

	onMount(async () => {
		initializeOAuth();

		if (isOAuthCallback()) {
			try {
				const s = await handleOAuthCallback();
				session.set(s);
				goto("/", { replaceState: true });
			} catch (e) {
				console.error("OAuth callback failed:", e);
				goto("/", { replaceState: true });
			}
		} else {
			const s = await restoreSession();
			session.set(s);
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
				<span class="logo-icon"><Hexagon size={40} strokeWidth={1.5} /></span>
			{/if}
			<div class="logo-text">
				<h1>
					{#if isDetailView}
						<a href="/" class="logo-link">ATProto Alternatives</a>
					{:else}
						ATProto Alternatives
					{/if}
				</h1>
				<p class="tagline">
					Discover decentralized alternatives built on the AT Protocol
				</p>
			</div>
		</div>
		<nav class="header-nav">
			<AuthButton currentSession={$session} />
			<button
				class="btn btn-primary"
				onclick={() => (showSubmitForm = true)}
			>
				<Plus size={18} strokeWidth={2.5} /> Submit Project
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
			<strong>ATProto Alternatives</strong> — A community-curated catalog of
			applications built on the
			<a href="https://atproto.com" target="_blank" rel="noopener noreferrer"
				>AT Protocol</a
			>
		</p>
		<p class="footer-meta">
			Have a suggestion?
			<button class="link-button" onclick={() => (showSubmitForm = true)}>
				Submit a project
			</button>
		</p>
	</div>
</footer>

{#if showSubmitForm}
	<SubmitForm
		onClose={() => (showSubmitForm = false)}
		existingTags={getAllTags()}
	/>
{/if}
