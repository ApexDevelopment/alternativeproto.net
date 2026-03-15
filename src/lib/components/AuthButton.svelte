<script lang="ts">
	import { LogIn, LogOut, X, Loader2 } from "lucide-svelte";
	import { login, logout } from "$lib/auth/oauth";
	import type { SessionInfo } from "$lib/auth/oauth";
	import { session } from "$lib/stores/session";

	let { currentSession }: { currentSession: SessionInfo | null } = $props();

	let showLoginModal = $state(false);
	let loginHandle = $state("");
	let loginLoading = $state(false);
	let loginError = $state("");

	async function handleLogout() {
		logout();
		session.set(null);
	}

	function openLoginModal() {
		showLoginModal = true;
		loginHandle = "";
		loginError = "";
		loginLoading = false;
	}

	function closeLoginModal() {
		showLoginModal = false;
	}

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		const handle = loginHandle.trim();
		if (!handle) return;

		loginLoading = true;
		loginError = "";

		try {
			await login(handle);
			// Page will redirect
		} catch (error) {
			console.error("Login error:", error);
			loginError =
				error instanceof Error ? error.message : "Failed to start login";
			loginLoading = false;
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) closeLoginModal();
	}
</script>

<div class="auth-button-container">
	{#if currentSession}
		<div class="auth-user">
			<span class="auth-handle">@{currentSession.handle}</span>
			<button class="btn btn-secondary auth-btn auth-signout" onclick={handleLogout}>
				<LogOut size={18} strokeWidth={2} /> Sign out
			</button>
		</div>
	{:else}
		<button class="btn btn-secondary auth-btn auth-signin" onclick={openLoginModal}>
			<LogIn size={18} strokeWidth={2} /> Sign in
		</button>
	{/if}
</div>

{#if showLoginModal}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_interactive_supports_focus -->
	<div
		class="modal-overlay"
		onclick={handleOverlayClick}
		onkeydown={() => {}}
		role="dialog"
		aria-modal="true"
	>
		<div class="modal login-modal">
			<div class="modal-header">
				<h2>Sign in with ATProto</h2>
				<button class="modal-close" aria-label="Close" onclick={closeLoginModal}>
					<X size={20} strokeWidth={2} />
				</button>
			</div>
			<form class="login-form" onsubmit={handleLogin}>
				<div class="form-group">
					<label for="login-handle">Your handle</label>
					<input
						type="text"
						id="login-handle"
						bind:value={loginHandle}
						required
						placeholder="user.bsky.social"
						autocomplete="username"
						autocapitalize="none"
						spellcheck="false"
					/>
					<small>Enter your Bluesky handle or custom domain</small>
				</div>
				{#if loginError}
					<p class="login-error">{loginError}</p>
				{/if}
				<div class="form-actions">
					<button type="submit" class="btn btn-primary btn-block" disabled={loginLoading}>
						{#if loginLoading}
							<Loader2 size={18} strokeWidth={2} /> Redirecting...
						{:else}
							<LogIn size={18} strokeWidth={2} /> Continue
						{/if}
					</button>
				</div>
				<p class="login-info">
					You'll be redirected to authorize this app. Your reviews will be
					stored in your own data repository.
				</p>
			</form>
		</div>
	</div>
{/if}
