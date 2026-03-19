<script lang="ts">
	import type { Submission } from "$lib/types";
	import { safeHref } from "$lib/types";
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
		Award,
		Pencil,
	} from "lucide-svelte";
	import { onMount } from "svelte";

	let {
		submission,
		sessionHandle = "",
		sessionDid = "",
		onEdit,
	}: {
		submission: Submission;
		sessionHandle?: string;
		sessionDid?: string;
		onEdit?: (submission: Submission) => void;
	} = $props();

	let canEdit = $derived(!!sessionDid && sessionDid === submission.did);

	let r = $derived(submission.record);
	let alts = $derived(r.alternativeTo ?? []);
	let tags = $derived(r.tags ?? []);
	let detailHref = $derived(`/project/${submission.did}/${submission.rkey}`);

	let alternativeText = $derived(
		alts.length > 0 ? `Alternative to ${alts[0]}` : "Unique ATProto app",
	);

	let authLabel = $derived(
		r.authType === "oauth"
			? "OAuth"
			: r.authType === "app-password"
				? "App Password"
				: "No Login",
	);

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
					{r.name}<!--
					-->{#if submission.attestedBy || submission.approval}<span class="name-badges">{#if submission.attestedBy}<span class="verified-badge" title="Verified by @{submission.attestedBy}"><BadgeCheck size={16} strokeWidth={2.5} /></span>{/if}{#if submission.approval === "verified"}<span class="approval-badge approval-badge--official" title="Approved by AlternativeProto"><Award size={16} strokeWidth={2.5} /></span>{:else if submission.approval === "community-verified"}<span class="approval-badge approval-badge--community" title="Community-approved submission"><Award size={16} strokeWidth={2.5} /></span>{/if}</span>{/if}
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
	<p class="project-description">{r.description}</p>
	<div class="project-tags">
		{#each tags as tag}
			<span class="tag">{tag}</span>
		{/each}
	</div>
	<div class="project-links">
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
	<div class="project-hover-links">
		<a
			href={safeHref(r.url)}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-primary"
		>
			Visit <ExternalLink size={14} strokeWidth={2.5} />
		</a>
		{#if r.isOpenSource && r.repositoryUrl}
			<a
				href={safeHref(r.repositoryUrl)}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-secondary"
			>
				<Code size={14} strokeWidth={2.5} /> Source
			</a>
		{/if}
		{#if canEdit && onEdit}
			<button
				class="btn btn-secondary"
				onclick={(e: MouseEvent) => { e.stopPropagation(); e.preventDefault(); onEdit(submission); }}
			>
				<Pencil size={14} strokeWidth={2.5} /> Edit
			</button>
		{/if}
	</div>
</article>
