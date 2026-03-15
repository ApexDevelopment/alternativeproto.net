<script lang="ts">
	import type { Submission } from "$lib/types";
	import {
		LockOpen,
		Lock,
		KeyRound,
		SquareAsterisk,
		UserRound,
		ExternalLink,
		Code,
	} from "lucide-svelte";

	let { submission }: { submission: Submission } = $props();

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
				<h3 class="project-name">{r.name}</h3>
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
	</div>
</article>
