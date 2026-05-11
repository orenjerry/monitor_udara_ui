<script lang="ts">
	import { currentPage } from '../stores';

	const pages = [
		{ id: 'dashboard', label: 'Dashboard', icon: 'grid' },
		{ id: 'history', label: 'History', icon: 'clock' },
		{ id: 'alert', label: 'Alert', icon: 'bell' },
		{ id: 'profil', label: 'Profil Anggota', icon: 'users' }
	];

	let alertCount = 7;

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
				<span class="alert-badge">{alertCount}</span>
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
</style>
