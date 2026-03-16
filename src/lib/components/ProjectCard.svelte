<script lang="ts">
	import type { Submission } from "$lib/types";
	import {
		urlMatchesHandle,
		hasSubmissionWithUrl,
		claimSubmission,
	} from "$lib/api";
	import {
		LockOpen,
		Lock,
		KeyRound,
		SquareAsterisk,
		UserRound,
		ExternalLink,
		Code,
		ShieldCheck,
		LoaderCircle,
		Check,
		BadgeCheck,
	} from "lucide-svelte";
	import { onMount } from "svelte";

	let {
		submission,
		sessionHandle = "",
		sessionDid = "",
	}: {
		submission: Submission;
		sessionHandle?: string;
		sessionDid?: string;
	} = $props();

	const r = submission.record;
	const alts = r.alternativeTo ?? [];
	const tags = r.tags ?? [];
	const detailHref = `/project/${submission.did}/${submission.rkey}`;

	const alternativeText =
		alts.length > 0 ? `Alternative to ${alts[0]}` : "Unique ATProto app";

	const authLabel =
		r.authType === "oauth"
			? "OAuth"
			: r.authType === "app-password"
				? "App Password"
				: "No Login";

	let canClaim = $state(false);
	let claimState = $state<"idle" | "claiming" | "claimed" | "error">("idle");

	onMount(async () => {
		if (
			!sessionHandle ||
			!sessionDid ||
			submission.did === sessionDid ||
			!urlMatchesHandle(r.url, sessionHandle)
		) {
			return;
		}

		const alreadyHas = await hasSubmissionWithUrl(sessionDid, r.url);
		if (!alreadyHas) {
			canClaim = true;
		}
	});

	async function handleClaim() {
		claimState = "claiming";
		try {
			const result = await claimSubmission(submission);
			claimState = result.success ? "claimed" : "error";
		} catch {
			claimState = "error";
		}
	}
</script>

<article class="project-card" data-project-id={submission.uri}>
	<a
		href={detailHref}
		class="project-card-link"
		aria-label="View {r.name} details"
	>
		<div class="project-header">
			<div class="project-icon">
				{#if submission.iconUrl}
					<img
						src={submission.iconUrl}
						alt="{r.name} icon"
						class="project-icon-img"
					/>
				{/if}
			</div>
			<div class="project-title-group">
				<h3 class="project-name">
					{r.name}
					{#if submission.attestedBy}
						<span class="verified-badge" title="Verified by @{submission.attestedBy}">
							<BadgeCheck size={16} strokeWidth={2.5} />
						</span>
					{/if}
				</h3>
				<span class="alternative-badge">{alternativeText}</span>
			</div>
			<div class="badge-group">
				<span
					class={r.isOpenSource
						? "open-source-badge"
						: "closed-source-badge"}
					title={r.isOpenSource ? "Open Source" : "Closed Source"}
				>
					{#if r.isOpenSource}
						<LockOpen size={14} strokeWidth={2.5} />
						Open Source
					{:else}
						<Lock size={14} strokeWidth={2.5} />
						Closed Source
					{/if}
				</span>
				<span
					class={r.authType === "oauth"
						? "oauth-badge"
						: r.authType === "app-password"
							? "app-password-badge"
							: "no-login-badge"}
					title={authLabel}
				>
					{#if r.authType === "oauth"}
						<KeyRound size={14} strokeWidth={2.5} />
					{:else if r.authType === "app-password"}
						<SquareAsterisk size={14} strokeWidth={2.5} />
					{:else}
						<UserRound size={14} strokeWidth={2.5} />
					{/if}
					{authLabel}
				</span>
			</div>
		</div>
	</a>
	<p class="project-description">{@html r.description}</p>
	<div class="project-tags">
		{#each tags as tag}
			<span class="tag">{tag}</span>
		{/each}
	</div>
	<div class="project-links">
		<a
			href={r.url}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-primary"
		>
			Visit Site <ExternalLink size={14} strokeWidth={2.5} />
		</a>
		{#if r.isOpenSource && r.repositoryUrl}
			<a
				href={r.repositoryUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-secondary"
			>
				<Code size={14} strokeWidth={2.5} /> View Source
			</a>
		{/if}
		{#if canClaim}
			<button
				class="btn btn-claim"
				class:btn-claim-success={claimState === "claimed"}
				class:btn-claim-error={claimState === "error"}
				onclick={(e: MouseEvent) => { e.stopPropagation(); handleClaim(); }}
				disabled={claimState === "claiming" || claimState === "claimed"}
			>
				{#if claimState === "claiming"}
					<LoaderCircle size={14} strokeWidth={2.5} class="spinning" />
				{:else if claimState === "claimed"}
					<Check size={14} strokeWidth={2.5} /> Claimed
				{:else if claimState === "error"}
					<ShieldCheck size={14} strokeWidth={2.5} /> Retry
				{:else}
					<ShieldCheck size={14} strokeWidth={2.5} /> Claim Project
				{/if}
			</button>
		{/if}
	</div>
</article>
