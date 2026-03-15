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
	} from "lucide-svelte";

	let { project }: { project: Project } = $props();

	const alternativeText =
		project.alternativeTo.length > 0
			? `Alternative to ${project.alternativeTo[0]}`
			: "Unique ATProto app";

	const authLabel =
		project.authType === "oauth"
			? "OAuth"
			: project.authType === "app-password"
				? "App Password"
				: "No Login";
</script>

<article class="project-card" data-project-id={project.id}>
	<a
		href="/project/{project.slug}"
		class="project-card-link"
		aria-label="View {project.name} details"
	>
		<div class="project-header">
			<div class="project-icon">
				{#if project.iconUrl}
					<img
						src={project.iconUrl}
						alt="{project.name} icon"
						class="project-icon-img"
					/>
				{:else}
					<span class="project-icon-emoji">{project.icon}</span>
				{/if}
			</div>
			<div class="project-title-group">
				<h3 class="project-name">{project.name}</h3>
				<span class="alternative-badge">{alternativeText}</span>
			</div>
			<div class="badge-group">
				<span
					class={project.isOpenSource
						? "open-source-badge"
						: "closed-source-badge"}
					title={project.isOpenSource ? "Open Source" : "Closed Source"}
				>
					{#if project.isOpenSource}
						<LockOpen size={14} strokeWidth={2.5} />
						Open Source
					{:else}
						<Lock size={14} strokeWidth={2.5} />
						Closed Source
					{/if}
				</span>
				<span
					class={project.authType === "oauth"
						? "oauth-badge"
						: project.authType === "app-password"
							? "app-password-badge"
							: "no-login-badge"}
					title={authLabel}
				>
					{#if project.authType === "oauth"}
						<KeyRound size={14} strokeWidth={2.5} />
					{:else if project.authType === "app-password"}
						<SquareAsterisk size={14} strokeWidth={2.5} />
					{:else}
						<UserRound size={14} strokeWidth={2.5} />
					{/if}
					{authLabel}
				</span>
			</div>
		</div>
	</a>
	<p class="project-description">{@html project.description}</p>
	<div class="project-tags">
		{#each project.tags as tag}
			<span class="tag">{tag}</span>
		{/each}
	</div>
	<div class="project-links">
		<a
			href={project.url}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-primary"
		>
			Visit Site <ExternalLink size={14} strokeWidth={2.5} />
		</a>
		{#if project.isOpenSource && project.repositoryUrl}
			<a
				href={project.repositoryUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-secondary"
			>
				<Code size={14} strokeWidth={2.5} /> View Source
			</a>
		{/if}
	</div>
</article>
