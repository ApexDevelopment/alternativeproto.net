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
		MessageSquare,
		LogIn,
		ShieldCheck,
		LoaderCircle,
		Check,
	} from "lucide-svelte";
	import ReviewForm from "./ReviewForm.svelte";
	import { onMount } from "svelte";

	let {
		submission,
		isSignedIn = false,
		sessionHandle = "",
		sessionDid = "",
	}: {
		submission: Submission;
		isSignedIn?: boolean;
		sessionHandle?: string;
		sessionDid?: string;
	} = $props();

	let reviewSubmitted = $state(false);

	const r = submission.record;
	const alts = r.alternativeTo ?? [];
	const tags = r.tags ?? [];

	const alternativeText =
		alts.length > 0 ? alts.join(", ") : "Unique ATProto app";

	const authLabel =
		r.authType === "oauth"
			? "OAuth"
			: r.authType === "app-password"
				? "App Password"
				: "No Login Required";

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

	function handleReviewSuccess() {
		reviewSubmitted = true;
	}
</script>

<div class="project-detail">
	<div class="project-detail-hero">
		<div class="project-detail-icon">
			{#if submission.iconUrl}
				<img
					src={submission.iconUrl}
					alt="{r.name} icon"
					class="project-detail-icon-img"
				/>
			{/if}
		</div>
		<div class="project-detail-header">
			<h1 class="project-detail-name">{r.name}</h1>
			<p class="project-detail-alternative">Alternative to {alternativeText}</p>
		</div>
	</div>

	<div class="project-detail-badges">
		<span class={r.isOpenSource ? "open-source-badge" : "closed-source-badge"}>
			{#if r.isOpenSource}
				<LockOpen size={16} strokeWidth={2.5} /> Open Source
			{:else}
				<Lock size={16} strokeWidth={2.5} /> Closed Source
			{/if}
		</span>
		<span
			class={r.authType === "oauth"
				? "oauth-badge"
				: r.authType === "app-password"
					? "app-password-badge"
					: "no-login-badge"}
		>
			{#if r.authType === "oauth"}
				<KeyRound size={16} strokeWidth={2.5} />
			{:else if r.authType === "app-password"}
				<SquareAsterisk size={16} strokeWidth={2.5} />
			{:else}
				<UserRound size={16} strokeWidth={2.5} />
			{/if}
			{authLabel}
		</span>
	</div>

	<div class="project-detail-description">
		<p>{@html r.description}</p>
	</div>

	<div class="project-detail-tags">
		{#each tags as tag}
			<span class="tag">{tag}</span>
		{/each}
	</div>

	<div class="project-detail-links">
		<a
			href={r.url}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-primary"
		>
			<ExternalLink size={18} strokeWidth={2.5} /> Visit {r.name}
		</a>
		{#if r.isOpenSource && r.repositoryUrl}
			<a
				href={r.repositoryUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-secondary"
			>
				<Code size={18} strokeWidth={2.5} /> View Source
			</a>
		{/if}
		{#if canClaim}
			<button
				class="btn btn-claim"
				class:btn-claim-success={claimState === "claimed"}
				class:btn-claim-error={claimState === "error"}
				onclick={handleClaim}
				disabled={claimState === "claiming" || claimState === "claimed"}
			>
				{#if claimState === "claiming"}
					<LoaderCircle size={18} strokeWidth={2.5} class="spinning" />
				{:else if claimState === "claimed"}
					<Check size={18} strokeWidth={2.5} /> Claimed
				{:else if claimState === "error"}
					<ShieldCheck size={18} strokeWidth={2.5} /> Retry
				{:else}
					<ShieldCheck size={18} strokeWidth={2.5} /> Claim Project
				{/if}
			</button>
		{/if}
	</div>

	<div class="project-detail-review-section">
		<h2><MessageSquare size={24} strokeWidth={2} /> Leave a Review</h2>

		{#if reviewSubmitted}
			<div class="review-success">
				<p>Thank you for your review!</p>
			</div>
		{:else if isSignedIn}
			<ReviewForm
				projectId={submission.uri}
				projectName={r.name}
				onSuccess={handleReviewSuccess}
			/>
		{:else}
			<div class="review-signin-prompt">
				<LogIn size={20} strokeWidth={2} />
				<p>Sign in with your ATProto account to leave a review</p>
			</div>
		{/if}
	</div>
</div>
