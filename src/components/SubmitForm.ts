import { submitProject } from "../api";
import type { SubmissionData } from "../types";
import { getIconSvg } from "../utils/icons";

export function createSubmitForm(
	onClose: () => void,
	existingTags: string[] = [],
): HTMLElement {
	const overlay = document.createElement("div");
	overlay.className = "modal-overlay";

	overlay.innerHTML = `
		<div class="modal">
		<div class="modal-header">
			<h2>Submit a Project</h2>
			<button class="modal-close" aria-label="Close">${getIconSvg("X", 20, 2)}</button>
		</div>
		<form id="submit-form" class="submit-form">
			<div class="form-group">
				<label for="project-name">Project Name *</label>
				<input type="text" id="project-name" name="name" required placeholder="e.g., MyApp" />
			</div>
			
			<div class="form-group">
				<label for="project-description">Description *</label>
				<textarea id="project-description" name="description" required rows="3" 
					placeholder="Brief description of what the project does..."></textarea>
			</div>
			
			<div class="form-group">
				<label for="project-icon">Icon (emoji) *</label>
				<input type="text" id="project-icon" name="icon" required placeholder="🚀" maxlength="4" />
				<small>Fallback emoji if no image icon is provided</small>
			</div>
			
			<div class="form-group">
				<label for="project-icon-url">Icon Image URL</label>
				<input type="url" id="project-icon-url" name="iconUrl" placeholder="https://example.com/icon.png" />
				<small>Optional: URL to an image icon (recommended: square, at least 112x112px)</small>
			</div>
			
			<div class="form-group">
				<label for="project-url">Project URL *</label>
				<input type="url" id="project-url" name="url" required placeholder="https://example.com" />
			</div>
			
			<div class="form-group">
				<label for="project-alternative">Alternative To</label>
				<input type="text" id="project-alternative" name="alternativeTo" 
					placeholder="e.g., Twitter, Reddit, Medium (comma-separated)" />
				<small>What popular services is this an alternative to? Leave blank if unique.</small>
			</div>
			
			<div class="form-group toggle-group">
				<span class="toggle-label-text">This project is open source</span>
				<label class="toggle-switch" for="project-opensource">
					<input type="checkbox" id="project-opensource" name="isOpenSource" />
					<span class="toggle-slider"></span>
				</label>
			</div>
			
			<div class="form-group" id="repo-url-group" style="display: none;">
				<label for="project-repo">Repository URL</label>
				<input type="url" id="project-repo" name="repositoryUrl" 
					placeholder="https://github.com/username/repo" />
			</div>
			
			<div class="form-group">
				<label for="project-auth">Authentication Type *</label>
				<select id="project-auth" name="authType" class="filter-select" required>
					<option value="oauth">OAuth (recommended)</option>
					<option value="app-password">App Password</option>
					<option value="none">No Login Required</option>
				</select>
				<small>How do users authenticate with this service?</small>
			</div>
			
			<div class="form-group">
				<label for="project-tags">Tags *</label>
				<div class="autocomplete-wrapper">
					<input type="text" id="project-tags" name="tags" required 
					placeholder="social, mobile, federation (comma-separated)" 
					autocomplete="off" />
					<div id="tag-suggestions" class="autocomplete-dropdown"></div>
				</div>
				<small>Enter comma-separated tags for categorization</small>
			</div>
			
			<div class="form-actions">
				<button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
				<button type="submit" class="btn btn-primary" id="submit-btn">Submit for Review</button>
			</div>
			
			<div id="form-message" class="form-message" style="display: none;"></div>
		</form>
		</div>
	`;

	const closeModal = () => {
		overlay.classList.add("closing");
		setTimeout(() => {
			overlay.remove();
			onClose();
		}, 200);
	};

	overlay.querySelector(".modal-close")!.addEventListener("click", closeModal);
	overlay.querySelector("#cancel-btn")!.addEventListener("click", closeModal);
	overlay.addEventListener("click", (e) => {
		if (e.target === overlay) closeModal();
	});

	// Toggle repository URL field based on open source checkbox
	const opensourceCheckbox = overlay.querySelector<HTMLInputElement>(
		"#project-opensource",
	)!;
	const authSelect = overlay.querySelector<HTMLSelectElement>("#project-auth")!;
	const repoUrlGroup =
		overlay.querySelector<HTMLDivElement>("#repo-url-group")!;

	opensourceCheckbox.addEventListener("change", () => {
		repoUrlGroup.style.display = opensourceCheckbox.checked ? "block" : "none";
	});

	// Tag autocomplete functionality
	const tagsInput = overlay.querySelector<HTMLInputElement>("#project-tags")!;
	const tagSuggestions =
		overlay.querySelector<HTMLDivElement>("#tag-suggestions")!;
	let selectedSuggestionIndex = -1;

	const getCurrentTagBeingTyped = (): { tag: string; startIndex: number } => {
		const cursorPos = tagsInput.selectionStart || 0;
		const value = tagsInput.value;

		// Find the start of the current tag (after last comma before cursor)
		let startIndex = 0;
		for (let i = cursorPos - 1; i >= 0; i--) {
			if (value[i] === ",") {
				startIndex = i + 1;
				break;
			}
		}

		// Find the end of the current tag (next comma after cursor or end)
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
	};

	const getAlreadyEnteredTags = (): string[] => {
		return tagsInput.value
			.split(",")
			.map((t) => t.trim().toLowerCase())
			.filter((t) => t.length > 0);
	};

	const showSuggestions = () => {
		const { tag: currentTag } = getCurrentTagBeingTyped();
		const enteredTags = getAlreadyEnteredTags();

		if (currentTag.length === 0) {
			tagSuggestions.style.display = "none";
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
			tagSuggestions.style.display = "none";
			return;
		}

		selectedSuggestionIndex = -1;
		tagSuggestions.innerHTML = matches
			.map(
				(tag, i) =>
					`<div class="autocomplete-item" data-index="${i}" data-tag="${tag}">${tag}</div>`,
			)
			.join("");
		tagSuggestions.style.display = "block";
	};

	const selectSuggestion = (tag: string) => {
		const value = tagsInput.value;
		const cursorPos = tagsInput.selectionStart || 0;

		// Find boundaries of current tag
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

		// Preserve spacing after comma
		const prefix = value.substring(0, startIndex);
		const suffix = value.substring(endIndex);
		const needsSpace = prefix.length > 0 && !prefix.endsWith(" ");

		tagsInput.value = prefix + (needsSpace ? " " : "") + tag + suffix;
		tagSuggestions.style.display = "none";
		tagsInput.focus();

		// Move cursor to end of inserted tag
		const newPos = prefix.length + (needsSpace ? 1 : 0) + tag.length;
		tagsInput.setSelectionRange(newPos, newPos);
	};

	const updateSelectedSuggestion = () => {
		const items = tagSuggestions.querySelectorAll(".autocomplete-item");
		items.forEach((item, i) => {
			item.classList.toggle("selected", i === selectedSuggestionIndex);
		});
	};

	tagsInput.addEventListener("input", showSuggestions);
	tagsInput.addEventListener("focus", showSuggestions);

	tagsInput.addEventListener("keydown", (e) => {
		const items = tagSuggestions.querySelectorAll(".autocomplete-item");
		if (items.length === 0 || tagSuggestions.style.display === "none") return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			selectedSuggestionIndex = Math.min(
				selectedSuggestionIndex + 1,
				items.length - 1,
			);
			updateSelectedSuggestion();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
			updateSelectedSuggestion();
		} else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
			e.preventDefault();
			const selectedItem = items[selectedSuggestionIndex] as HTMLElement;
			selectSuggestion(selectedItem.dataset.tag!);
		} else if (e.key === "Escape") {
			tagSuggestions.style.display = "none";
		}
	});

	tagSuggestions.addEventListener("click", (e) => {
		const item = (e.target as HTMLElement).closest(
			".autocomplete-item",
		) as HTMLElement;
		if (item) {
			selectSuggestion(item.dataset.tag!);
		}
	});

	// Hide suggestions when clicking outside
	overlay.addEventListener("click", (e) => {
		if (!(e.target as HTMLElement).closest(".autocomplete-wrapper")) {
			tagSuggestions.style.display = "none";
		}
	});

	// Handle form submission
	const form = overlay.querySelector<HTMLFormElement>("#submit-form")!;
	const submitBtn = overlay.querySelector<HTMLButtonElement>("#submit-btn")!;
	const formMessage = overlay.querySelector<HTMLDivElement>("#form-message")!;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		submitBtn.disabled = true;
		submitBtn.textContent = "Submitting...";

		const formData = new FormData(form);
		const tagsString = formData.get("tags") as string;
		const alternativeString = formData.get("alternativeTo") as string;
		const iconUrlValue = (formData.get("iconUrl") as string).trim();

		const data: SubmissionData = {
			name: formData.get("name") as string,
			description: formData.get("description") as string,
			icon: formData.get("icon") as string,
			iconUrl: iconUrlValue.length > 0 ? iconUrlValue : undefined,
			url: formData.get("url") as string,
			alternativeTo: alternativeString
				.split(",")
				.map((a) => a.trim())
				.filter((a) => a.length > 0),
			isOpenSource: opensourceCheckbox.checked,
			authType: authSelect.value as "oauth" | "app-password" | "none",
			repositoryUrl: opensourceCheckbox.checked
				? (formData.get("repositoryUrl") as string)
				: undefined,
			tags: tagsString
				.split(",")
				.map((t) => t.trim().toLowerCase())
				.filter((t) => t.length > 0),
		};

		try {
			const result = await submitProject(data);

			formMessage.style.display = "block";
			formMessage.className = `form-message ${result.success ? "success" : "error"}`;
			formMessage.textContent = result.message;

			if (result.success) {
				form.reset();
				setTimeout(closeModal, 2000);
			} else {
				submitBtn.disabled = false;
				submitBtn.textContent = "Submit for Review";
			}
		} catch (error) {
			formMessage.style.display = "block";
			formMessage.className = "form-message error";
			formMessage.textContent = "An error occurred. Please try again.";
			submitBtn.disabled = false;
			submitBtn.textContent = "Submit for Review";
		}
	});

	return overlay;
}
