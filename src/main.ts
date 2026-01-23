import "./style.css";
import {
	projects,
	getAllTags,
	getAllAlternatives,
	getProjectBySlug,
} from "./data";
import type { Project } from "./types";
import { createProjectCard } from "./components/ProjectCard";
import { createProjectDetail } from "./components/ProjectDetail";
import { createSearchBar, type SearchFilters } from "./components/SearchBar";
import { createSubmitForm } from "./components/SubmitForm";
import { createAuthButton } from "./components/AuthButton";
import { getIconSvg } from "./utils/icons";
import {
	initializeOAuth,
	restoreSession,
	validateSession,
	handleOAuthCallback,
	isOAuthCallback,
	type SessionInfo,
} from "./auth/oauth";

// Route types
type Route = { type: "list" } | { type: "project"; slug: string };

function parseRoute(): Route {
	const hash = window.location.hash;

	// Match #/project/{slug}
	const projectMatch = hash.match(/^#\/project\/([^/]+)$/);
	if (projectMatch) {
		return { type: "project", slug: projectMatch[1] };
	}

	// Default to list view
	return { type: "list" };
}

class App {
	private appContainer: HTMLElement;
	private mainContainer: HTMLElement;
	private session: SessionInfo | null = null;
	private currentFilters: SearchFilters = {
		query: "",
		tag: "",
		alternativeTo: "",
		openSourceOnly: false,
	};
	private currentRoute: Route = { type: "list" };

	constructor() {
		this.appContainer = document.querySelector<HTMLDivElement>("#app")!;
		this.mainContainer = document.createElement("main");
		this.init();
	}

	private async init(): Promise<void> {
		// Initialize OAuth before anything else
		initializeOAuth();

		// Check if we're returning from OAuth callback
		if (isOAuthCallback()) {
			try {
				this.session = await handleOAuthCallback();
				// URL is already cleaned up by handleOAuthCallback
			} catch (e) {
				console.error("OAuth callback failed:", e);
			}
		} else {
			// Try to restore existing session
			this.session = await restoreSession();
		}

		// Set up hash change listener for routing
		window.addEventListener("hashchange", () => this.handleRouteChange());

		// Initial render
		this.handleRouteChange();
	}

	private async handleRouteChange(): Promise<void> {
		this.currentRoute = parseRoute();

		// Validate session when navigating to a project detail page
		// This ensures we show the correct auth state for the review form
		if (this.currentRoute.type === "project" && this.session) {
			this.session = await validateSession();
		}

		this.render();
	}

	private render(): void {
		this.appContainer.innerHTML = "";

		// Header (always shown)
		const header = this.createHeader();
		this.appContainer.appendChild(header);

		// Main content based on route
		this.mainContainer = document.createElement("main");
		this.mainContainer.className = "main-content";

		if (this.currentRoute.type === "project") {
			this.renderProjectDetail(this.currentRoute.slug);
		} else {
			this.renderListView();
		}

		this.appContainer.appendChild(this.mainContainer);

		// Footer (always shown)
		const footer = this.createFooter();
		this.appContainer.appendChild(footer);
	}

	private renderListView(): void {
		// Search bar
		const searchBar = createSearchBar(
			getAllTags(),
			getAllAlternatives(),
			(filters) => this.handleFilterChange(filters),
		);
		this.mainContainer.appendChild(searchBar);

		// Results count
		const resultsCount = document.createElement("div");
		resultsCount.id = "results-count";
		resultsCount.className = "results-count";
		this.mainContainer.appendChild(resultsCount);

		// Projects grid
		const projectsContainer = document.createElement("div");
		projectsContainer.className = "projects-grid";
		this.mainContainer.appendChild(projectsContainer);

		// Render projects
		this.renderProjects(projectsContainer, this.filterProjects(projects));
	}

	private renderProjectDetail(slug: string): void {
		const project = getProjectBySlug(slug);

		if (!project) {
			this.mainContainer.innerHTML = `
				<div class="not-found">
					<span class="not-found-icon">${getIconSvg("FileQuestion", 64, 1.5)}</span>
					<h2>Project not found</h2>
					<p>The project you're looking for doesn't exist.</p>
					<a href="#/" class="btn btn-primary">
						${getIconSvg("ArrowLeft", 18, 2)} Back to catalog
					</a>
				</div>
			`;
			return;
		}

		const detail = createProjectDetail(project, this.session !== null);
		this.mainContainer.appendChild(detail);
	}

	private createHeader(): HTMLElement {
		const header = document.createElement("header");
		header.className = "site-header";

		const isDetailView = this.currentRoute.type === "project";

		header.innerHTML = `
	    <div class="header-content">
	      <div class="logo-section">
	        ${
						isDetailView
							? `
	          <a href="#/" class="back-link" aria-label="Back to catalog">
	            ${getIconSvg("ArrowLeft", 24, 2)}
	          </a>
	        `
							: `
	          <span class="logo-icon">${getIconSvg("Hexagon", 40, 1.5)}</span>
	        `
					}
	        <div class="logo-text">
	          <h1>${isDetailView ? `<a href="#/" class="logo-link">ATProto Alternatives</a>` : "ATProto Alternatives"}</h1>
	          <p class="tagline">Discover decentralized alternatives built on the AT Protocol</p>
	        </div>
	      </div>
	      <nav class="header-nav" id="header-nav">
	        <div id="auth-button-slot"></div>
	        <button id="submit-btn" class="btn btn-primary">
	          ${getIconSvg("Plus", 18, 2.5)} Submit Project
	        </button>
	      </nav>
	    </div>
	  `;

		header.querySelector("#submit-btn")!.addEventListener("click", () => {
			this.openSubmitForm();
		});

		// Add auth button
		this.updateAuthButton(header);

		return header;
	}

	private updateAuthButton(container?: HTMLElement): void {
		const slot = (container || document).querySelector("#auth-button-slot");
		if (!slot) return;

		slot.innerHTML = "";
		const authButton = createAuthButton(this.session, () =>
			this.handleAuthChange(),
		);
		slot.appendChild(authButton);
	}

	private async handleAuthChange(): Promise<void> {
		this.session = await restoreSession();
		this.render();
	}

	private createFooter(): HTMLElement {
		const footer = document.createElement("footer");
		footer.className = "site-footer";

		footer.innerHTML = `
	    <div class="footer-content">
	      <p>
	        <strong>ATProto Alternatives</strong> — A community-curated catalog of applications built on the 
	        <a href="https://atproto.com" target="_blank" rel="noopener noreferrer">AT Protocol</a>
	      </p>
	      <p class="footer-meta">
	        Have a suggestion? <button id="footer-submit-btn" class="link-button">Submit a project</button>
	      </p>
	    </div>
	  `;

		footer
			.querySelector("#footer-submit-btn")!
			.addEventListener("click", () => {
				this.openSubmitForm();
			});

		return footer;
	}

	private openSubmitForm(): void {
		const form = createSubmitForm(() => {
			// onClose callback - could refresh data if needed
		}, getAllTags());
		document.body.appendChild(form);
	}

	private handleFilterChange(filters: SearchFilters): void {
		this.currentFilters = filters;
		const projectsContainer =
			this.mainContainer.querySelector(".projects-grid");
		if (projectsContainer) {
			this.renderProjects(
				projectsContainer as HTMLElement,
				this.filterProjects(projects),
			);
		}
	}

	private filterProjects(projectList: Project[]): Project[] {
		const hasActiveFilters =
			this.currentFilters.query ||
			this.currentFilters.tag ||
			this.currentFilters.alternativeTo ||
			this.currentFilters.openSourceOnly;

		return projectList.filter((project) => {
			// Hide alternative-client projects on initial view (no active filters)
			if (!hasActiveFilters && project.tags.includes("alternative-client")) {
				return false;
			}

			// Text search
			if (this.currentFilters.query) {
				const searchText = this.currentFilters.query;
				const matchesName = project.name.toLowerCase().includes(searchText);
				const matchesDescription = project.description
					.toLowerCase()
					.includes(searchText);
				const matchesTags = project.tags.some((tag) =>
					tag.toLowerCase().includes(searchText),
				);
				const matchesAlt = project.alternativeTo.some((alt) =>
					alt.toLowerCase().includes(searchText),
				);

				if (
					!matchesName &&
					!matchesDescription &&
					!matchesTags &&
					!matchesAlt
				) {
					return false;
				}
			}

			// Tag filter
			if (
				this.currentFilters.tag &&
				!project.tags.includes(this.currentFilters.tag)
			) {
				return false;
			}

			// Alternative to filter
			if (
				this.currentFilters.alternativeTo &&
				!project.alternativeTo.includes(this.currentFilters.alternativeTo)
			) {
				return false;
			}

			// Open source filter
			if (this.currentFilters.openSourceOnly && !project.isOpenSource) {
				return false;
			}

			return true;
		});
	}

	private renderProjects(container: HTMLElement, projectList: Project[]): void {
		container.innerHTML = "";

		// Update results count
		const resultsCount = document.getElementById("results-count");
		if (resultsCount) {
			const totalCount = projects.length;
			const filteredCount = projectList.length;

			if (filteredCount === totalCount) {
				resultsCount.textContent = `Showing all ${totalCount} projects`;
			} else {
				resultsCount.textContent = `Showing ${filteredCount} of ${totalCount} projects`;
			}
		}

		if (projectList.length === 0) {
			container.innerHTML = `
	      <div class="no-results">
	        <span class="no-results-icon">${getIconSvg("SearchX", 48, 1.5)}</span>
	        <h3>No projects found</h3>
	        <p>Try adjusting your search or filters</p>
	      </div>
	    `;
			return;
		}

		projectList.forEach((project) => {
			const card = createProjectCard(project);
			container.appendChild(card);
		});
	}
}

// Initialize the app
new App();
