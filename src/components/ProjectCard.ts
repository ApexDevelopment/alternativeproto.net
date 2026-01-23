import type { Project } from "../types";
import { getIconSvg } from "../utils/icons";

export function createProjectCard(project: Project): HTMLElement {
	const card = document.createElement("article");
	card.className = "project-card";
	card.setAttribute("data-project-id", project.id);

	const tagsHtml = project.tags
		.map((tag) => `<span class="tag">${tag}</span>`)
		.join("");

	const alternativeText =
		project.alternativeTo.length > 0
			? `Alternative to ${project.alternativeTo[0]}`
			: "Unique ATProto app";

	const iconHtml = project.iconUrl
		? `<img src="${project.iconUrl}" alt="${project.name} icon" class="project-icon-img" />`
		: `<span class="project-icon-emoji">${project.icon}</span>`;

	const openSourceIcon = project.isOpenSource
		? getIconSvg("LockOpen", 14, 2.5)
		: getIconSvg("Lock", 14, 2.5);

	const authIcon =
		project.authType === "oauth"
			? getIconSvg("KeyRound", 14, 2.5)
			: project.authType === "app-password"
				? getIconSvg("SquareAsterisk", 14, 2.5)
				: getIconSvg("UserRound", 14, 2.5);

	const authLabel =
		project.authType === "oauth"
			? "OAuth"
			: project.authType === "app-password"
				? "App Password"
				: "No Login";

	card.innerHTML = `
		<a href="#/project/${project.slug}" class="project-card-link" aria-label="View ${project.name} details">
		<div class="project-header">
			<div class="project-icon">${iconHtml}</div>
			<div class="project-title-group">
			<h3 class="project-name">${project.name}</h3>
			<span class="alternative-badge">${alternativeText}</span>
			</div>
			<div class="badge-group">
			<span class="${project.isOpenSource ? "open-source-badge" : "closed-source-badge"}" title="${project.isOpenSource ? "Open Source" : "Closed Source"}">
				${openSourceIcon} ${project.isOpenSource ? "Open Source" : "Closed Source"}
			</span>
			<span class="${project.authType === "oauth" ? "oauth-badge" : project.authType === "app-password" ? "app-password-badge" : "no-login-badge"}" title="${authLabel}">
				${authIcon} ${authLabel}
			</span>
			</div>
		</div>
		</a>
		<p class="project-description">${project.description}</p>
		<div class="project-tags">${tagsHtml}</div>
		<div class="project-links">
		<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
			Visit Site ${getIconSvg("ExternalLink", 14, 2.5)}
		</a>
		${
			project.isOpenSource && project.repositoryUrl
				? `<a href="${project.repositoryUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
				${getIconSvg("Code", 14, 2.5)} View Source
			</a>`
				: ""
		}
		</div>
	`;

	return card;
}
