<script lang="ts">
	import type { Project } from "$lib/types";
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
	} from "lucide-svelte";
	import ReviewForm from "./ReviewForm.svelte";

	let { project, isSignedIn = false }: { project: Project; isSignedIn?: boolean } = $props();

	let reviewSubmitted = $state(false);

	const alternativeText =
		project.alternativeTo.length > 0
			? project.alternativeTo.join(", ")
			: "Unique ATProto app";

	const authLabel =
		project.authType === "oauth"
			? "OAuth"
			: project.authType === "app-password"
				? "App Password"
				: "No Login Required";

	function handleReviewSuccess() {
		reviewSubmitted = true;
	}
</script>

<div class="project-detail">
	<div class="project-detail-hero">
		<div class="project-detail-icon">
			{#if project.iconUrl}
				<img
					src={project.iconUrl}
					alt="{project.name} icon"
					class="project-detail-icon-img"
				/>
			{:else}
				<span class="project-detail-icon-emoji">{project.icon}</span>
			{/if}
		</div>
		<div class="project-detail-header">
			<h1 class="project-detail-name">{project.name}</h1>
			<p class="project-detail-alternative">Alternative to {alternativeText}</p>
		</div>
	</div>

	<div class="project-detail-badges">
		<span class={project.isOpenSource ? "open-source-badge" : "closed-source-badge"}>
			{#if project.isOpenSource}
				<LockOpen size={16} strokeWidth={2.5} /> Open Source
			{:else}
				<Lock size={16} strokeWidth={2.5} /> Closed Source
			{/if}
		</span>
		<span
			class={project.authType === "oauth"
				? "oauth-badge"
				: project.authType === "app-password"
					? "app-password-badge"
					: "no-login-badge"}
		>
			{#if project.authType === "oauth"}
				<KeyRound size={16} strokeWidth={2.5} />
			{:else if project.authType === "app-password"}
				<SquareAsterisk size={16} strokeWidth={2.5} />
			{:else}
				<UserRound size={16} strokeWidth={2.5} />
			{/if}
			{authLabel}
		</span>
	</div>

	<div class="project-detail-description">
		<p>{@html project.description}</p>
	</div>

	<div class="project-detail-tags">
		{#each project.tags as tag}
			<span class="tag">{tag}</span>
		{/each}
	</div>

	<div class="project-detail-links">
		<a
			href={project.url}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-primary"
		>
			<ExternalLink size={18} strokeWidth={2.5} /> Visit {project.name}
		</a>
		{#if project.isOpenSource && project.repositoryUrl}
			<a
				href={project.repositoryUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-secondary"
			>
				<Code size={18} strokeWidth={2.5} /> View Source
			</a>
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
				projectId={project.id}
				projectName={project.name}
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
