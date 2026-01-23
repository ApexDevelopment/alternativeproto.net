import { login, logout, type SessionInfo } from "../auth/oauth";
import { getIconSvg } from "../utils/icons";

export function createAuthButton(
	session: SessionInfo | null,
	onAuthChange: () => void,
): HTMLElement {
	const container = document.createElement("div");
	container.className = "auth-button-container";

	const buttonClasses = "btn btn-secondary auth-btn";

	if (session) {
		// Signed in state
		container.innerHTML = `
		<div class="auth-user">
			<span class="auth-handle">@${session.handle}</span>
			<button class="${buttonClasses} auth-signout">
			${getIconSvg("LogOut", 18, 2)} Sign out
			</button>
		</div>
		`;

		container
			.querySelector(".auth-signout")!
			.addEventListener("click", async () => {
				await logout();
				onAuthChange();
			});
	} else {
		// Signed out state
		container.innerHTML = `
		<button class="${buttonClasses} auth-signin">
			${getIconSvg("LogIn", 18, 2)} Sign in
		</button>
		`;

		container.querySelector(".auth-signin")!.addEventListener("click", () => {
			showLoginModal(onAuthChange);
		});
	}

	return container;
}

function showLoginModal(_onAuthChange: () => void): void {
	const overlay = document.createElement("div");
	overlay.className = "modal-overlay";

	overlay.innerHTML = `
		<div class="modal login-modal">
		<div class="modal-header">
			<h2>Sign in with ATProto</h2>
			<button class="modal-close" aria-label="Close">${getIconSvg("X", 20, 2)}</button>
		</div>
		<form id="login-form" class="login-form">
			<div class="form-group">
			<label for="login-handle">Your handle</label>
			<input 
				type="text" 
				id="login-handle" 
				name="handle" 
				required 
				placeholder="user.bsky.social"
				autocomplete="username"
				autocapitalize="none"
				spellcheck="false"
			/>
			<small>Enter your Bluesky handle or custom domain</small>
			</div>
			<div class="form-actions">
			<button type="submit" class="btn btn-primary btn-block">
				${getIconSvg("LogIn", 18, 2)} Continue
			</button>
			</div>
			<p class="login-info">
			You'll be redirected to authorize this app. Your reviews will be stored in your own data repository.
			</p>
		</form>
		</div>
	`;

	// Close handlers
	const closeModal = () => {
		overlay.remove();
	};

	overlay.querySelector(".modal-close")!.addEventListener("click", closeModal);
	overlay.addEventListener("click", (e) => {
		if (e.target === overlay) closeModal();
	});

	// Form submission
	const form = overlay.querySelector("#login-form") as HTMLFormElement;
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const handleInput = form.querySelector("#login-handle") as HTMLInputElement;
		const handle = handleInput.value.trim();

		if (!handle) return;

		// Disable form while processing
		const submitBtn = form.querySelector(
			'button[type="submit"]',
		) as HTMLButtonElement;
		submitBtn.disabled = true;
		submitBtn.innerHTML = `${getIconSvg("Loader2", 18, 2)} Redirecting...`;

		try {
			await login(handle);
			// Page will redirect, no need to close modal
		} catch (error) {
			console.error("Login error:", error);
			submitBtn.disabled = false;
			submitBtn.innerHTML = `${getIconSvg("LogIn", 18, 2)} Continue`;

			// Show error
			let errorEl = form.querySelector(".login-error") as HTMLElement;
			if (!errorEl) {
				errorEl = document.createElement("p");
				errorEl.className = "login-error";
				form.querySelector(".form-actions")!.before(errorEl);
			}
			errorEl.textContent =
				error instanceof Error ? error.message : "Failed to start login";
		}
	});

	document.body.appendChild(overlay);

	// Focus the input
	(overlay.querySelector("#login-handle") as HTMLInputElement).focus();
}
