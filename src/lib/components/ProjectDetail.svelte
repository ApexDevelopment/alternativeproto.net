<script lang="ts">
	import type { Submission } from "$lib/types";
	import type { DisplayReview } from "$lib/types";
	import { safeHref } from "$lib/types";
	import {
		urlMatchesHandle,
		hasSubmissionWithUrl,
		claimSubmission,
		createVote,
		deleteVote,
		getExistingVote,
		fetchReviews,
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
		BadgeCheck,
		Award,
		ThumbsUp,
		ThumbsDown,
		Pencil,
		Star,
		ChevronDown,
	} from "lucide-svelte";
	import ReviewForm from "./ReviewForm.svelte";
	import { onMount } from "svelte";

	let {
		submission,
		isSignedIn = false,
		sessionHandle = "",
		sessionDid = "",
		onEdit,
	}: {
		submission: Submission;
		isSignedIn?: boolean;
		sessionHandle?: string;
		sessionDid?: string;
		onEdit?: (submission: Submission) => void;
	} = $props();

	let canEdit = $derived(!!sessionDid && sessionDid === submission.did);

	let reviewSubmitted = $state(false);

	// Vote state
	type VoteState = "none" | "up" | "down";
	let voteState = $state<VoteState>("none");
	let voteRkey = $state<string | null>(null);
	let voteLoading = $state(false);

	async function handleVote(direction: VoteState) {
		if (!isSignedIn || voteLoading || direction === "none") return;
		voteLoading = true;
		try {
			// Toggle off if already voted the same way
			if (voteState === direction && voteRkey) {
				await deleteVote(voteRkey);
				voteState = "none";
				voteRkey = null;
			} else {
				// Delete existing vote if switching direction
				if (voteRkey) {
					await deleteVote(voteRkey);
				}
				const result = await createVote(submission.uri, submission.cid, direction);
				voteRkey = result.uri.split("/").pop() ?? null;
				voteState = direction;
			}
		} catch (e) {
			console.error("Vote error:", e);
		} finally {
			voteLoading = false;
		}
	}

	let r = $derived(submission.record);
	let alts = $derived(r.alternativeTo ?? []);
	let tags = $derived(r.tags ?? []);

	let alternativeText = $derived(
		alts.length > 0 ? alts.join(", ") : "Unique ATProto app",
	);

	let authLabel = $derived(
		r.authType === "oauth"
			? "OAuth"
			: r.authType === "app-password"
				? "App Password"
				: "No Login Required",
	);

	let canClaim = $state(false);
	let claimState = $state<"idle" | "claiming" | "claimed" | "error">("idle");

	// Reviews state
	let allReviews = $state<DisplayReview[]>([]);
	let reviewsLoading = $state(true);
	let visibleCount = $state(3);
	let visibleReviews = $derived(allReviews.slice(0, visibleCount));
	let hasMoreReviews = $derived(visibleCount < allReviews.length);

	onMount(async () => {
		// Fetch reviews
		fetchReviews(submission.did, submission.rkey)
			.then((r) => { allReviews = r; })
			.catch((e) => console.error("Failed to fetch reviews:", e))
			.finally(() => { reviewsLoading = false; });

		// Restore existing vote from PDS
		if (isSignedIn) {
			const existing = await getExistingVote(submission.uri);
			if (existing) {
				voteState = existing.direction;
				voteRkey = existing.rkey;
			}
		}

		// Check claim eligibility
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

	function loadMoreReviews() {
		visibleCount += 5;
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
			<h1 class="project-detail-name">
				{r.name}<!--
				-->{#if submission.attestedBy || submission.approval}<span class="name-badges">{#if submission.attestedBy}<span class="verified-badge" title="Verified by @{submission.attestedBy}"><BadgeCheck size={20} strokeWidth={2.5} /></span>{/if}{#if submission.approval === "verified"}<span class="approval-badge approval-badge--official" title="Approved by AlternativeProto"><Award size={20} strokeWidth={2.5} /></span>{:else if submission.approval === "community-verified"}<span class="approval-badge approval-badge--community" title="Community-approved submission"><Award size={20} strokeWidth={2.5} /></span>{/if}</span>{/if}
			</h1>
			<p class="project-detail-alternative">Alternative to {alternativeText}</p>
		</div>
		<div class="project-detail-hero-actions">
			<a
				href={safeHref(r.url)}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-primary"
			>
				<ExternalLink size={16} strokeWidth={2.5} /> Visit {r.name}
			</a>
			{#if r.isOpenSource && r.repositoryUrl}
				<a
					href={safeHref(r.repositoryUrl)}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-secondary"
				>
					<Code size={16} strokeWidth={2.5} /> View Source
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
						<LoaderCircle size={16} strokeWidth={2.5} class="spinning" />
					{:else if claimState === "claimed"}
						<Check size={16} strokeWidth={2.5} /> Claimed
					{:else if claimState === "error"}
						<ShieldCheck size={16} strokeWidth={2.5} /> Retry
					{:else}
						<ShieldCheck size={16} strokeWidth={2.5} /> Claim
					{/if}
				</button>
			{/if}
			{#if canEdit && onEdit}
				<button
					class="btn btn-secondary"
					onclick={() => onEdit(submission)}
				>
					<Pencil size={16} strokeWidth={2.5} /> Edit
				</button>
			{/if}
		</div>
	</div>

	<div class="project-detail-body">
	<div class="project-detail-info-box">
		<p>{r.description}</p>
		<hr class="project-detail-info-divider" />
		<div class="project-detail-info-badges">
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
		{#if tags.length > 0}
			<div class="project-detail-info-tags">
				{#each tags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</div>

	{#if isSignedIn}
		<hr class="project-detail-section-divider" />
		<div class="vote-box">
			<div class="vote-box-info">
				<p class="vote-box-question">Is this a good submission?</p>
				{#if submission.handle}
					<p class="vote-box-submitter">Submitted by @{submission.handle}</p>
				{/if}
			</div>
			<div class="vote-box-actions">
				<button
					class="btn vote-btn vote-btn-yes"
					class:vote-btn-active={voteState === "up"}
					onclick={() => handleVote("up")}
					disabled={voteLoading}
				>
					{#if voteLoading && voteState !== "up"}
						<LoaderCircle size={16} strokeWidth={2} class="spinning" />
					{:else}
						<ThumbsUp size={16} strokeWidth={2} />
					{/if}
					Yes
				</button>
				<button
					class="btn vote-btn vote-btn-no"
					class:vote-btn-active={voteState === "down"}
					onclick={() => handleVote("down")}
					disabled={voteLoading}
				>
					{#if voteLoading && voteState !== "down"}
						<LoaderCircle size={16} strokeWidth={2} class="spinning" />
					{:else}
						<ThumbsDown size={16} strokeWidth={2} />
					{/if}
					No
				</button>
			</div>
		</div>
	{/if}

	<hr class="project-detail-section-divider" />
	<div class="project-detail-review-section">
		<h2><MessageSquare size={24} strokeWidth={2} /> Leave a review about {r.name}</h2>

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

	{#if reviewsLoading}
		<hr class="project-detail-section-divider" />
		<div class="reviews-loading">
			<LoaderCircle size={24} strokeWidth={2} class="spinning" />
			<p>Loading reviews…</p>
		</div>
	{:else if allReviews.length > 0}
		<hr class="project-detail-section-divider" />
		<div class="reviews-list">
			<h2><MessageSquare size={24} strokeWidth={2} /> Reviews ({allReviews.length})</h2>
			{#each visibleReviews as review (review.did + review.rkey)}
				<div class="review-card">
					<div class="review-card-header">
						<span class="review-card-author">@{review.handle ?? review.did}</span>
						<span class="review-card-stars">
							{#each Array(5) as _, i}
								<Star size={14} strokeWidth={2} fill={i < review.rating ? "var(--star-color)" : "none"} color={i < review.rating ? "var(--star-color)" : "var(--text-muted)"} />
							{/each}
						</span>
					</div>
					<p class="review-card-text">{review.text}</p>
					<span class="review-card-date">{new Date(review.createdAt).toLocaleDateString()}</span>
				</div>
			{/each}
			{#if hasMoreReviews}
				<button class="btn btn-secondary load-more-btn" onclick={loadMoreReviews}>
					<ChevronDown size={16} strokeWidth={2} /> Load more reviews
				</button>
			{/if}
		</div>
	{/if}
	</div>
</div>
