import type { Project } from "../types";
import { getIconSvg } from "../utils/icons";
import { createReviewForm } from "./ReviewForm";

export function createProjectDetail(
	project: Project,
	isSignedIn: boolean = false,
): HTMLElement {
	const container = document.createElement("div");
	container.className = "project-detail";

	const tagsHtml = project.tags
		.map((tag) => `<span class="tag">${tag}</span>`)
		.join("");

	const alternativeText =
		project.alternativeTo.length > 0
			? project.alternativeTo.join(", ")
			: "Unique ATProto app";

	const iconHtml = project.iconUrl
		? `<img src="${project.iconUrl}" alt="${project.name} icon" class="project-detail-icon-img" />`
		: `<span class="project-detail-icon-emoji">${project.icon}</span>`;

	const openSourceIcon = project.isOpenSource
		? getIconSvg("LockOpen", 16, 2.5)
		: getIconSvg("Lock", 16, 2.5);

	const authIcon =
		project.authType === "oauth"
			? getIconSvg("KeyRound", 16, 2.5)
			: project.authType === "app-password"
				? getIconSvg("SquareAsterisk", 16, 2.5)
				: getIconSvg("UserRound", 16, 2.5);

	const authLabel =
		project.authType === "oauth"
			? "OAuth"
			: project.authType === "app-password"
				? "App Password"
				: "No Login Required";

	container.innerHTML = `
		<div class="project-detail-hero">
			<div class="project-detail-icon">${iconHtml}</div>
			<div class="project-detail-header">
				<h1 class="project-detail-name">${project.name}</h1>
				<p class="project-detail-alternative">Alternative to ${alternativeText}</p>
			</div>
		</div>

		<div class="project-detail-badges">
			<span class="${project.isOpenSource ? "open-source-badge" : "closed-source-badge"}">
				${openSourceIcon} ${project.isOpenSource ? "Open Source" : "Closed Source"}
			</span>
			<span class="${project.authType === "oauth" ? "oauth-badge" : project.authType === "app-password" ? "app-password-badge" : "no-login-badge"}">
				${authIcon} ${authLabel}
			</span>
		</div>

		<div class="project-detail-description">
			<p>${project.description}</p>
		</div>

		<div class="project-detail-tags">
			${tagsHtml}
		</div>

		<div class="project-detail-links">
			<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
				${getIconSvg("ExternalLink", 18, 2.5)} Visit ${project.name}
			</a>
			${
				project.isOpenSource && project.repositoryUrl
					? `<a href="${project.repositoryUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
					${getIconSvg("Code", 18, 2.5)} View Source
				</a>`
					: ""
			}
		</div>

		<div class="project-detail-review-section">
			<h2>${getIconSvg("MessageSquare", 24, 2)} Leave a Review</h2>
			<div class="review-form-container-slot"></div>
		</div>
	`;

	// Add review form if signed in
	const reviewSlot = container.querySelector(
		".review-form-container-slot",
	) as HTMLElement;

	if (isSignedIn) {
		const form = createReviewForm(project.id, project.name, {
			onSuccess: () => {
				reviewSlot.innerHTML = `
					<div class="review-success">
						${getIconSvg("CheckCircle", 24, 2)}
						<p>Thank you for your review!</p>
					</div>
				`;
			},
			onCancel: () => {
				// Re-render the form
				reviewSlot.innerHTML = "";
				const newForm = createReviewForm(project.id, project.name, {
					onSuccess: () => {},
					onCancel: () => {},
				});
				reviewSlot.appendChild(newForm);
			},
		});
		reviewSlot.appendChild(form);
	} else {
		reviewSlot.innerHTML = `
			<div class="review-signin-prompt">
				${getIconSvg("LogIn", 20, 2)}
				<p>Sign in with your ATProto account to leave a review</p>
			</div>
		`;
	}

	return container;
}
