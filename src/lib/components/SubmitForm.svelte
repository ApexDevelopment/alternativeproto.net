<script lang="ts">
	import { tick } from "svelte";
	import { X } from "lucide-svelte";
	import { submitProject, updateProject } from "$lib/api";
	import type { SubmissionData, AuthType, Submission } from "$lib/types";

	let {
		onClose,
		existingTags = [],
		existingSubmissions = [],
		editSubmission,
	}: {
		onClose: () => void;
		existingTags?: string[];
		existingSubmissions?: Submission[];
		editSubmission?: Submission;
	} = $props();

	let duplicateWarning = $state("");

	let isEdit = $derived(!!editSubmission);
	let editRecord = $derived(editSubmission?.record);

	// Capture initial edit values (intentionally non-reactive — we only
	// want the values at mount time to pre-populate form fields)
	// svelte-ignore state_referenced_locally
	const initialEdit = editSubmission;

	let name = $state(initialEdit?.record.name ?? "");
	let description = $state(initialEdit?.record.description ?? "");
	let iconFile = $state<File | null>(null);
	let iconPreviewUrl = $state(initialEdit?.iconUrl ?? "");
	let iconWarningShown = $state(false);
	let url = $state(initialEdit?.record.url ?? "");
	let alternativeToStr = $state((initialEdit?.record.alternativeTo ?? []).join(", "));
	let isOpenSource = $state(initialEdit?.record.isOpenSource ?? false);
	let repositoryUrl = $state(initialEdit?.record.repositoryUrl ?? "");
	let authType = $state<AuthType>((initialEdit?.record.authType as AuthType) ?? "oauth");
	let tagsStr = $state((initialEdit?.record.tags ?? []).join(", "));

	let submitting = $state(false);
	let formMessage = $state("");
	let formMessageType = $state<"success" | "error">("success");
	let closing = $state(false);

	// Tag autocomplete
	let tagSuggestionsVisible = $state(false);
	let tagSuggestions = $state<string[]>([]);
	let selectedSuggestionIndex = $state(-1);
	let tagsInput: HTMLInputElement;

	function closeModal() {
		closing = true;
		setTimeout(() => {
			onClose();
		}, 200);
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) closeModal();
	}

	function handleIconChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		iconFile = file;
		iconWarningShown = false;
		if (iconPreviewUrl) {
			URL.revokeObjectURL(iconPreviewUrl);
		}
		iconPreviewUrl = file ? URL.createObjectURL(file) : "";
	}

	function getCurrentTagBeingTyped(): { tag: string; startIndex: number } {
		const cursorPos = tagsInput?.selectionStart || 0;
		const value = tagsStr;

		let startIndex = 0;
		for (let i = cursorPos - 1; i >= 0; i--) {
			if (value[i] === ",") {
				startIndex = i + 1;
				break;
			}
		}

		let endIndex = value.length;
		for (let i = cursorPos; i < value.length; i++) {
			if (value[i] === ",") {
				endIndex = i;
				break;
			}
		}

		return {
			tag: value.substring(startIndex, endIndex).trim().toLowerCase(),
			startIndex,
		};
	}

	function getAlreadyEnteredTags(): string[] {
		return tagsStr
			.split(",")
			.map((t) => t.trim().toLowerCase())
			.filter((t) => t.length > 0);
	}

	function showSuggestions() {
		const { tag: currentTag } = getCurrentTagBeingTyped();
		const enteredTags = getAlreadyEnteredTags();

		if (currentTag.length === 0) {
			tagSuggestionsVisible = false;
			return;
		}

		const matches = existingTags
			.filter(
				(tag) =>
					tag.toLowerCase().includes(currentTag) &&
					!enteredTags.includes(tag.toLowerCase()),
			)
			.slice(0, 6);

		if (matches.length === 0) {
			tagSuggestionsVisible = false;
			return;
		}

		selectedSuggestionIndex = -1;
		tagSuggestions = matches;
		tagSuggestionsVisible = true;
	}

	function selectSuggestion(tag: string) {
		const value = tagsStr;
		const cursorPos = tagsInput?.selectionStart || 0;

		let startIndex = 0;
		for (let i = cursorPos - 1; i >= 0; i--) {
			if (value[i] === ",") {
				startIndex = i + 1;
				break;
			}
		}

		let endIndex = value.length;
		for (let i = cursorPos; i < value.length; i++) {
			if (value[i] === ",") {
				endIndex = i;
				break;
			}
		}

		const prefix = value.substring(0, startIndex);
		const suffix = value.substring(endIndex);
		const needsSpace = prefix.length > 0 && !prefix.endsWith(" ");

		tagsStr = prefix + (needsSpace ? " " : "") + tag + suffix;
		tagSuggestionsVisible = false;
		tagsInput?.focus();
	}

	function handleTagKeydown(e: KeyboardEvent) {
		if (!tagSuggestionsVisible || tagSuggestions.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			selectedSuggestionIndex = Math.min(
				selectedSuggestionIndex + 1,
				tagSuggestions.length - 1,
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
		} else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
			e.preventDefault();
			selectSuggestion(tagSuggestions[selectedSuggestionIndex]);
		} else if (e.key === "Escape") {
			tagSuggestionsVisible = false;
		}
	}

	function normalizeUrl(input: string): string {
		let u = input.trim();
		if (u && !/^https?:\/\//i.test(u)) {
			u = "https://" + u;
		}
		return u;
	}

	/** Normalize a URL for comparison: lowercase, strip trailing slash, strip www. */
	function urlForComparison(raw: string): string {
		try {
			const u = new URL(normalizeUrl(raw));
			const host = u.hostname.replace(/^www\./i, "");
			return (u.protocol + "//" + host + u.pathname.replace(/\/+$/, "") + u.search).toLowerCase();
		} catch {
			return raw.trim().toLowerCase().replace(/\/+$/, "");
		}
	}

	function checkDuplicates() {
		if (isEdit) { duplicateWarning = ""; return; }

		const normalizedUrl = urlForComparison(url);
		const trimmedName = name.trim().toLowerCase();
		const warnings: string[] = [];

		for (const s of existingSubmissions) {
			if (urlForComparison(s.record.url) === normalizedUrl) {
				warnings.push(`A submission with this URL already exists: "${s.record.name}"`);
				break;
			}
		}

		if (trimmedName) {
			for (const s of existingSubmissions) {
				if (s.record.name.toLowerCase() === trimmedName) {
					warnings.push(`A submission with this name already exists: "${s.record.name}"`);
					break;
				}
			}
		}

		duplicateWarning = warnings.join(" ");
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		// Normalize URL before validation/submission
		url = normalizeUrl(url);

		const hasExistingIcon = isEdit && !!editRecord?.icon;
		if (!iconFile && !iconWarningShown && !hasExistingIcon) {
			iconWarningShown = true;
			document.getElementById("project-icon")?.scrollIntoView({ behavior: "smooth", block: "center" });
			return;
		}

		submitting = true;

		const data: SubmissionData = {
			name,
			description,
			iconFile: iconFile ?? undefined,
			url,
			alternativeTo: alternativeToStr
				.split(",")
				.map((a) => a.trim())
				.filter((a) => a.length > 0),
			isOpenSource,
			authType,
			repositoryUrl: isOpenSource ? repositoryUrl : undefined,
			tags: tagsStr
				.split(",")
				.map((t) => t.trim().toLowerCase())
				.filter((t) => t.length > 0),
		};

		try {
			const result = isEdit
				? await updateProject(editSubmission!.rkey, data, editRecord?.icon)
				: await submitProject(data);
			formMessage = result.message;
			formMessageType = result.success ? "success" : "error";
			await tick();
			document.getElementById("form-result")?.scrollIntoView({ behavior: "smooth", block: "center" });

			if (result.success) {
				setTimeout(closeModal, 2000);
			} else {
				submitting = false;
			}
		} catch (err) {
			formMessage =
				err instanceof Error
					? err.message
					: "An error occurred. Please try again.";
			formMessageType = "error";
			submitting = false;
			await tick();
			document.getElementById("form-result")?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}
</script>

<div
	class="modal-overlay"
	class:closing
	onclick={handleOverlayClick}
	onkeydown={() => {}}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<div class="modal">
		<div class="modal-header">
			<h2>{isEdit ? 'Edit Project' : 'Submit a Project'}</h2>
			<button class="modal-close" aria-label="Close" onclick={closeModal}>
				<X size={20} strokeWidth={2} />
			</button>
		</div>
		<form class="submit-form" onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="project-name">Project Name *</label>
				<input
					type="text"
					id="project-name"
					bind:value={name}
					required
					placeholder="e.g., MyApp"
					onblur={checkDuplicates}
				/>
			</div>

			<div class="form-group">
				<label for="project-description">Description *</label>
				<textarea
					id="project-description"
					bind:value={description}
					required
					rows="3"
					placeholder="Brief description of what the project does..."
				></textarea>
			</div>

			<div class="form-group">
				<label for="project-icon">Project Icon</label>
				<input
					type="file"
					id="project-icon"
					accept="image/png,image/jpeg,image/webp,image/svg+xml"
					onchange={handleIconChange}
				/>
				<small>Recommended: square image, at least 128x128px</small>
				{#if iconPreviewUrl}
					<img
						src={iconPreviewUrl}
						alt="Icon preview"
						style="width: 64px; height: 64px; margin-top: 0.5rem; border-radius: 8px; object-fit: cover;"
					/>
				{/if}
			</div>

			{#if iconWarningShown && !iconFile}
				<div class="form-message error" style="margin-bottom: 1rem;">
					<strong>No icon selected.</strong> We'll try to fetch the project's
					favicon, but if none is found the project won't be listed until an
					icon is added.
				</div>
			{/if}

			<div class="form-group">
				<label for="project-url">Project URL *</label>
				<input
					type="text"
					id="project-url"
					bind:value={url}
					required
					placeholder="https://example.com"
					onblur={() => { url = normalizeUrl(url); checkDuplicates(); }}
				/>
			</div>

			{#if duplicateWarning}
				<div class="form-message error" style="margin-bottom: 1rem;">
					{duplicateWarning}
				</div>
			{/if}

			<div class="form-group">
				<label for="project-alternative">Alternative To</label>
				<input
					type="text"
					id="project-alternative"
					bind:value={alternativeToStr}
					placeholder="e.g., Twitter/X, Reddit, Medium (comma-separated)"
				/>
				<small
					>What popular services is this an alternative to? Leave blank if
					unique.</small
				>
			</div>

			<div class="form-group toggle-group">
				<span class="toggle-label-text">This project is open source</span>
				<label class="toggle-switch" for="project-opensource">
					<input
						type="checkbox"
						id="project-opensource"
						bind:checked={isOpenSource}
					/>
					<span class="toggle-slider"></span>
				</label>
			</div>

			{#if isOpenSource}
				<div class="form-group">
					<label for="project-repo">Repository URL</label>
					<input
						type="url"
						id="project-repo"
						bind:value={repositoryUrl}
						placeholder="https://github.com/username/repo"
					/>
				</div>
			{/if}

			<div class="form-group">
				<label for="project-auth">Authentication Type *</label>
				<select
					id="project-auth"
					class="filter-select"
					bind:value={authType}
					required
				>
					<option value="oauth">OAuth</option>
					<option value="app-password">App Password</option>
					<option value="none">No Login Required</option>
				</select>
				<small>How do users authenticate with this service?</small>
			</div>

			<div class="form-group">
				<label for="project-tags">Tags *</label>
				<div class="autocomplete-wrapper">
					<input
						type="text"
						id="project-tags"
						bind:this={tagsInput}
						bind:value={tagsStr}
						required
						placeholder="social, blogging, events (comma-separated)"
						autocomplete="off"
						oninput={showSuggestions}
						onfocus={showSuggestions}
						onkeydown={handleTagKeydown}
					/>
					{#if tagSuggestionsVisible}
						<div class="autocomplete-dropdown" style="display: block;">
							{#each tagSuggestions as tag, i}
								<button
									type="button"
									class="autocomplete-item"
									class:selected={i === selectedSuggestionIndex}
									onclick={() => selectSuggestion(tag)}
								>
									{tag}
								</button>
							{/each}
						</div>
					{/if}
				</div>
				<small>Enter comma-separated tags for categorization</small>
			</div>

			<div class="form-actions">
				<button
					type="button"
					class="btn btn-secondary"
					onclick={closeModal}
				>
					Cancel
				</button>
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						{isEdit ? 'Saving...' : 'Submitting...'}
					{:else if iconWarningShown && !iconFile && !isEdit}
						Submit Anyway
					{:else}
						{isEdit ? 'Save Changes' : 'Submit'}
					{/if}
				</button>
			</div>

			{#if formMessage}
				<div id="form-result" class="form-message {formMessageType}">
					{formMessage}
				</div>
			{/if}
		</form>
	</div>
</div>
