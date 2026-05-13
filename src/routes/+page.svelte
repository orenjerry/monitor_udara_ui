<script lang="ts">
	import { currentPage } from '../lib/stores';
	import Sidebar from '../lib/components/Sidebar.svelte';
	import Dashboard from '../lib/components/Dashboard.svelte';
	import History from '../lib/components/History.svelte';
	import Alert from '../lib/components/Alert.svelte';
	import Profil from '../lib/components/Profil.svelte';
</script>

<div class="app-container">
	<Sidebar />
	<main class="main">
		{#if $currentPage === 'dashboard'}
			<section class="page active">
				<Dashboard />
			</section>
		{:else if $currentPage === 'history'}
			<section class="page active">
				<History />
			</section>
		{:else if $currentPage === 'alert'}
			<section class="page active">
				<Alert />
			</section>
		{:else if $currentPage === 'profil'}
			<section class="page active">
				<Profil />
			</section>
		{/if}
	</main>
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(:root) {
		--navy: #01013f;
		--navy2: #02026a;
		--navy3: #03039a;
		--accent: #4f8ef7;
		--accent2: #7fb3ff;
		--card-bg: rgba(255, 255, 255, 0.06);
		--card-border: rgba(255, 255, 255, 0.12);
		--text: #e8edf8;
		--text-muted: rgba(232, 237, 248, 0.55);
		--success: #22d6a0;
		--warning: #f59e0b;
		--danger: #f43f5e;
		--info: #38bdf8;
	}

	:global(body) {
		font-family: 'Plus Jakarta Sans', sans-serif;
		background: var(--navy);
		color: var(--text);
		min-height: 100vh;
		display: flex;
		overflow: auto;
	}

	:global(::-webkit-scrollbar) {
		width: 4px;
	}

	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 2px;
	}

	.app-container {
		display: flex;
		width: 100%;
		min-height: 100vh;
	}

	.main {
		flex: 1;
		overflow-y: auto;
		position: relative;
	}

	.page {
		position: relative;
		padding: 32px;
		opacity: 0;
		transform: translateX(30px);
		transition: opacity 0.4s ease, transform 0.4s ease;
		pointer-events: none;
		visibility: hidden;
		display: none;
	}

	.page.active {
		opacity: 1;
		transform: translateX(0);
		pointer-events: all;
		visibility: visible;
		display: block;
	}

	/* Tablet: 768px and down */
	@media (max-width: 768px) {
		:global(body) {
			flex-direction: column;
		}

		.app-container {
			flex-direction: column;
			height: auto;
			min-height: 100vh;
		}

		.main {
			flex: 1;
			overflow: auto;
		}

		.page {
			position: relative;
			inset: auto;
			overflow: visible;
			padding: 24px 16px;
			opacity: 1;
			transform: none;
			pointer-events: all;
			visibility: visible;
			display: block;
		}

		.page.active {
			opacity: 1;
			transform: none;
			pointer-events: all;
			visibility: visible;
			display: block;
		}
	}

	/* Phone: 640px and down */
	@media (max-width: 640px) {
		.main {
			padding-bottom: 70px;
			overflow: auto;
		}

		.page {
			padding: 20px 14px 90px;
		}
	}

	/* Small phone: 480px and down */
	@media (max-width: 480px) {
		.page {
			padding: 16px 12px 90px;
		}
	}
</style>
