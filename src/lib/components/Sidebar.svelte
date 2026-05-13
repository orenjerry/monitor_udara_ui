<script lang="ts">
	import { currentPage, alertCount } from '../stores';
	import { getWarningsCount } from '$lib/api';
	import { onMount } from 'svelte';

	type PageId = 'dashboard' | 'history' | 'alert' | 'profil';

	const DEMO_MAC = 'D4:E9:F4:8A:AF:4C'; // Hardcoded MAC for single device

	const pages: Array<{ id: PageId; label: string; icon: string }> = [
		{ id: 'dashboard', label: 'Dashboard', icon: 'grid' },
		{ id: 'history', label: 'History', icon: 'clock' },
		{ id: 'alert', label: 'Alert', icon: 'bell' },
		{ id: 'profil', label: 'Profil Anggota', icon: 'users' }
	];

	function getIcon(type: string) {
		const icons: Record<string, string> = {
			grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
			clock:
				'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><polyline points="12 6 12 12 16 14"/>',
			bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
			users:
				'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
		};
		return icons[type] || '';
	}

	onMount(() => {
		// Fetch initial warning count
		getWarningsCount(DEMO_MAC)
			.then((count) => alertCount.set(count))
			.catch(() => alertCount.set(0));

		// Poll for warning count updates every 10 seconds
		const interval = setInterval(() => {
			getWarningsCount(DEMO_MAC)
				.then((count) => alertCount.set(count))
				.catch(() => {});
		}, 10000);

		return () => clearInterval(interval);
	});
</script>

<nav class="sidebar">
	<div class="sidebar-logo">
		<div class="sidebar-logo-icon">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
				<path d="M12 6v6l4 2" />
			</svg>
		</div>
		Monitoring Udara
	</div>
	{#each pages as page}
		<div
			class="nav-item {$currentPage === page.id ? 'active' : ''}"
			onclick={() => currentPage.set(page.id)}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && currentPage.set(page.id)}
		>
			<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				{@html getIcon(page.icon)}
			</svg>
			{page.label}
			{#if page.id === 'alert'}
				<span class="alert-badge">{$alertCount}</span>
			{/if}
		</div>
	{/each}
</nav>

<style>
	.sidebar {
		width: 220px;
		min-height: 100vh;
		background: rgba(0, 0, 0, 0.35);
		border-right: 1px solid rgba(255, 255, 255, 0.12);
		display: flex;
		flex-direction: column;
		padding: 28px 0;
		flex-shrink: 0;
	}

	.sidebar-logo {
		padding: 0 24px 32px;
		font-size: 15px;
		font-weight: 700;
		color: #fff;
		letter-spacing: 0.5px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.sidebar-logo-icon {
		width: 32px;
		height: 32px;
		background: linear-gradient(135deg, #4f8ef7, #03039a);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 24px;
		cursor: pointer;
		transition: all 0.3s;
		border-radius: 0;
		color: rgba(232, 237, 248, 0.55);
		font-size: 14px;
		font-weight: 500;
		position: relative;
		margin: 2px 12px;
		border-radius: 10px;
	}

	.nav-item:hover {
		background: rgba(255, 255, 255, 0.07);
		color: #e8edf8;
	}

	.nav-item.active {
		background: #4f8ef7;
		color: #fff;
		box-shadow: 0 4px 20px rgba(79, 142, 247, 0.4);
	}

	.nav-icon {
		width: 18px;
		height: 18px;
		opacity: 0.8;
	}

	.nav-item.active .nav-icon {
		opacity: 1;
	}

	.alert-badge {
		margin-left: auto;
		background: #f43f5e;
		color: #fff;
		font-size: 10px;
		font-weight: 700;
		padding: 2px 7px;
		border-radius: 10px;
	}

	/* Tablet: 768px and down */
	@media (max-width: 768px) {
		.sidebar {
			width: 200px;
			padding: 20px 0;
		}

		.sidebar-logo {
			padding: 0 20px 24px;
			font-size: 14px;
			gap: 8px;
		}

		.sidebar-logo-icon {
			width: 28px;
			height: 28px;
		}

		.nav-item {
			padding: 10px 20px;
			font-size: 13px;
			gap: 10px;
			margin: 2px 8px;
		}

		.alert-badge {
			font-size: 9px;
			padding: 1px 5px;
		}
	}

	/* Phone: 640px and down - Bottom Navigation */
	@media (max-width: 640px) {
		.sidebar {
			width: 100%;
			min-height: auto;
			border-right: none;
			border-top: 1px solid rgba(255, 255, 255, 0.12);
			flex-direction: row;
			padding: 0;
			align-items: center;
			justify-content: space-around;
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			background: rgba(0, 0, 0, 0.5);
			backdrop-filter: blur(10px);
			z-index: 1000;
			height: 70px;
		}

		.sidebar-logo {
			display: none;
		}

		.nav-item {
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 4px;
			padding: 8px 12px;
			margin: 0;
			font-size: 11px;
			border-radius: 8px;
			min-width: 60px;
			text-align: center;
		}

		.nav-item:hover {
			background: rgba(255, 255, 255, 0.05);
		}

		.nav-item.active {
			box-shadow: 0 2px 12px rgba(79, 142, 247, 0.3);
		}

		.nav-icon {
			width: 20px;
			height: 20px;
		}

		.alert-badge {
			margin-left: 0;
			position: absolute;
			top: 2px;
			right: 2px;
			font-size: 8px;
			padding: 1px 4px;
		}
	}

	/* Small phone: 480px and down */
	@media (max-width: 480px) {
		.nav-item {
			padding: 6px 8px;
			min-width: 50px;
			font-size: 10px;
		}

		.nav-icon {
			width: 18px;
			height: 18px;
		}

		.alert-badge {
			font-size: 7px;
			padding: 1px 3px;
		}
	}
</style>
