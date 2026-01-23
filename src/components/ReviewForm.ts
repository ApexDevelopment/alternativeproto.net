import { createReview } from "../auth/oauth";
import { getIconSvg } from "../utils/icons";

export interface ReviewFormCallbacks {
	onSuccess: () => void;
	onCancel: () => void;
}

export function createReviewForm(
	projectId: string,
	projectName: string,
	callbacks: ReviewFormCallbacks,
): HTMLElement {
	const container = document.createElement("div");
	container.className = "review-form-container";

	container.innerHTML = `
	<form class="review-form">
		<div class="form-group">
		<label>Rating</label>
		<div class="star-rating" role="radiogroup" aria-label="Rating">
			${[1, 2, 3, 4, 5]
				.map(
					(n) => `
						<button type="button" class="star-btn" data-rating="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">
							${getIconSvg("Star", 24, 2)}
						</button>
						`,
				)
				.join("")}
		</div>
		<input type="hidden" name="rating" id="rating-input" required />
		</div>
		
		<div class="form-group">
		<label for="review-text">Your thoughts</label>
		<textarea 
			id="review-text" 
			name="text" 
			required 
			rows="4" 
			maxlength="3000"
			placeholder="Share your experience with this project..."
		></textarea>
		<small class="char-count"><span id="char-count">0</span>/1000 characters</small>
		</div>
		
		<div class="form-group toggle-group">
		<span class="toggle-label-text">Is this a good alternative to the listed services?</span>
		<label class="toggle-switch" for="is-good-alt">
			<input type="checkbox" id="is-good-alt" name="isGoodAlternative" checked />
			<span class="toggle-slider"></span>
			<span class="toggle-text toggle-yes">Yes</span>
			<span class="toggle-text toggle-no">No</span>
		</label>
		</div>
		
		<div class="review-form-actions">
			<button type="button" class="btn btn-secondary review-cancel">Cancel</button>
			<button type="submit" class="btn btn-primary review-submit" disabled>
				${getIconSvg("Send", 16, 2)} Submit Review
			</button>
		</div>
		
		<p class="review-form-info">
		${getIconSvg("Info", 14, 2)} Your review will be stored in your ATProto repository
		</p>
	</form>
	`;

	const form = container.querySelector(".review-form") as HTMLFormElement;
	const ratingInput = container.querySelector(
		"#rating-input",
	) as HTMLInputElement;
	const textArea = container.querySelector(
		"#review-text",
	) as HTMLTextAreaElement;
	const charCount = container.querySelector("#char-count") as HTMLSpanElement;
	const submitBtn = container.querySelector(
		".review-submit",
	) as HTMLButtonElement;
	const starBtns = container.querySelectorAll(".star-btn");

	let selectedRating = 0;

	// Star rating interaction
	starBtns.forEach((btn, index) => {
		btn.addEventListener("click", () => {
			selectedRating = index + 1;
			ratingInput.value = selectedRating.toString();
			updateStars();
			validateForm();
		});

		btn.addEventListener("mouseenter", () => {
			highlightStars(index + 1);
		});
	});

	container
		.querySelector(".star-rating")!
		.addEventListener("mouseleave", () => {
			updateStars();
		});

	function highlightStars(count: number): void {
		starBtns.forEach((btn, i) => {
			btn.classList.toggle("star-hover", i < count);
		});
	}

	function updateStars(): void {
		starBtns.forEach((btn, i) => {
			btn.classList.remove("star-hover");
			btn.classList.toggle("star-filled", i < selectedRating);
		});
	}

	// Character count
	textArea.addEventListener("input", () => {
		const count = textArea.value.length;
		charCount.textContent = count.toString();
		charCount.parentElement!.classList.toggle("over-limit", count > 1000);
		validateForm();
	});

	// Form validation
	function validateForm(): void {
		const hasRating = selectedRating >= 1 && selectedRating <= 5;
		const hasText =
			textArea.value.trim().length > 0 && textArea.value.length <= 3000;
		submitBtn.disabled = !(hasRating && hasText);
	}

	// Cancel button
	container.querySelector(".review-cancel")!.addEventListener("click", () => {
		callbacks.onCancel();
	});

	// Form submission
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const isGoodAlt = (
			container.querySelector("#is-good-alt") as HTMLInputElement
		).checked;

		submitBtn.disabled = true;
		submitBtn.innerHTML = `${getIconSvg("Loader2", 16, 2)} Submitting...`;

		try {
			const success = await createReview({
				projectId,
				rating: selectedRating,
				text: textArea.value.trim(),
				isGoodAlternative: isGoodAlt,
				createdAt: new Date().toISOString(),
			});

			if (success) {
				// Show success state
				container.innerHTML = `
			<div class="review-success">
			${getIconSvg("CheckCircle", 32, 2)}
			<p>Thanks for your review!</p>
			</div>
		`;
				setTimeout(() => callbacks.onSuccess(), 1500);
			} else {
				throw new Error("Failed to submit review");
			}
		} catch (error) {
			console.error("Review submission error:", error);
			submitBtn.disabled = false;
			submitBtn.innerHTML = `${getIconSvg("Send", 16, 2)} Submit Review`;

			// Show error message
			let errorEl = form.querySelector(".review-error") as HTMLElement;
			if (!errorEl) {
				errorEl = document.createElement("p");
				errorEl.className = "review-error";
				form.querySelector(".review-form-actions")!.before(errorEl);
			}
			errorEl.textContent =
				error instanceof Error ? error.message : "Failed to submit review";
		}
	});

	return container;
}
