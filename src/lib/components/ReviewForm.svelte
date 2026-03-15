<script lang="ts">
	import { Star, Send, Info, Loader2, CheckCircle } from "lucide-svelte";
	import { createReview } from "$lib/api";

	let {
		projectId,
		projectName: _projectName,
		onSuccess,
	}: {
		projectId: string;
		projectName: string;
		onSuccess: () => void;
	} = $props();

	let selectedRating = $state(0);
	let hoverRating = $state(0);
	let reviewText = $state("");
	let isGoodAlternative = $state(true);
	let submitting = $state(false);
	let submitted = $state(false);
	let errorMessage = $state("");

	let charCount = $derived(reviewText.length);
	let isValid = $derived(
		selectedRating >= 1 &&
			selectedRating <= 5 &&
			reviewText.trim().length > 0 &&
			reviewText.length <= 3000,
	);

	function handleStarClick(rating: number) {
		selectedRating = rating;
	}

	function handleStarEnter(rating: number) {
		hoverRating = rating;
	}

	function handleStarsLeave() {
		hoverRating = 0;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!isValid || submitting) return;

		submitting = true;
		errorMessage = "";

		try {
			const success = await createReview({
				projectId,
				rating: selectedRating,
				text: reviewText.trim(),
				isGoodAlternative,
				createdAt: new Date().toISOString(),
			});

			if (success) {
				submitted = true;
				setTimeout(() => onSuccess(), 1500);
			} else {
				throw new Error("Failed to submit review");
			}
		} catch (error) {
			console.error("Review submission error:", error);
			errorMessage =
				error instanceof Error ? error.message : "Failed to submit review";
		} finally {
			submitting = false;
		}
	}
</script>

{#if submitted}
	<div class="review-success">
		<CheckCircle size={32} strokeWidth={2} />
		<p>Thanks for your review!</p>
	</div>
{:else}
	<div class="review-form-container">
		<form class="review-form" onsubmit={handleSubmit}>
			<div class="form-group">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label>Rating</label>
				<!-- svelte-ignore a11y_no_static_element_interactions a11y_interactive_supports_focus -->
				<div
					class="star-rating"
					role="radiogroup"
					aria-label="Rating"
					onmouseleave={handleStarsLeave}
				>
					{#each [1, 2, 3, 4, 5] as n}
						<button
							type="button"
							class="star-btn"
							class:star-hover={n <= hoverRating}
							class:star-filled={n <= selectedRating}
							aria-label="{n} star{n > 1 ? 's' : ''}"
							onclick={() => handleStarClick(n)}
							onmouseenter={() => handleStarEnter(n)}
						>
							<Star size={24} strokeWidth={2} />
						</button>
					{/each}
				</div>
			</div>

			<div class="form-group">
				<label for="review-text">Your thoughts</label>
				<textarea
					id="review-text"
					bind:value={reviewText}
					required
					rows="4"
					maxlength="3000"
					placeholder="Share your experience with this project..."
				></textarea>
				<small class="char-count" class:over-limit={charCount > 1000}>
					<span>{charCount}</span>/1000 characters
				</small>
			</div>

			<div class="form-group toggle-group">
				<span class="toggle-label-text"
					>Is this a good alternative to the listed services?</span
				>
				<label class="toggle-switch" for="is-good-alt">
					<input
						type="checkbox"
						id="is-good-alt"
						bind:checked={isGoodAlternative}
					/>
					<span class="toggle-slider"></span>
					<span class="toggle-text toggle-yes">Yes</span>
					<span class="toggle-text toggle-no">No</span>
				</label>
			</div>

			{#if errorMessage}
				<p class="review-error">{errorMessage}</p>
			{/if}

			<div class="review-form-actions">
				<button type="submit" class="btn btn-primary review-submit" disabled={!isValid || submitting}>
					{#if submitting}
						<Loader2 size={16} strokeWidth={2} /> Submitting...
					{:else}
						<Send size={16} strokeWidth={2} /> Submit Review
					{/if}
				</button>
			</div>

			<p class="review-form-info">
				<Info size={14} strokeWidth={2} /> Your review will be stored in your ATProto
				repository
			</p>
		</form>
	</div>
{/if}
