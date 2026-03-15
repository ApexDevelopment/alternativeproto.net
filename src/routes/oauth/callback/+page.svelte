<script lang="ts">
	// OAuth callback is handled in the layout's onMount.
	// This page just needs to exist so the route is valid.
	// The layout will detect isOAuthCallback() and redirect to "/".
</script>

<div class="not-found">
	<p>Processing authentication...</p>
</div>
