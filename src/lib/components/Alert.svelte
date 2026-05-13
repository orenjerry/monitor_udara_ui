<script lang="ts">
	import { onMount } from 'svelte';
	import { getWarnings, dismissWarning, dismissWarningsBulk } from '$lib/api';
	import { alertCount } from '$lib/stores';

	const DEMO_MAC = 'D4:E9:F4:8A:AF:4C'; // Hardcoded MAC for single device

	interface AlertItem {
		id: number;
		type: 'co2-alert' | 'temp-alert' | 'hum-alert' | 'pm-alert';
		icon: string;
		time: string;
		msg: string;
		room: string;
	}

	let allAlerts = $state<AlertItem[]>([]);
	const MAX_VISIBLE = 4;
	let visibleAlerts = $derived.by(() => allAlerts.slice(0, MAX_VISIBLE));
	let hiddenAlerts = $derived.by(() => allAlerts.slice(MAX_VISIBLE));

	let showingMore = $state(false);
	let isClearing = $state(false);

	function toggleMoreAlerts() {
		showingMore = !showingMore;
	}

	async function handleDismiss(alert: AlertItem) {
		try {
			await dismissWarning(alert.id);
			// Remove from list
			allAlerts = allAlerts.filter((a) => a.id !== alert.id);
			// Update badge count
			alertCount.set(allAlerts.length);
		} catch (err) {
			console.error('Failed to dismiss warning:', err);
		}
	}

	async function handleClearAll() {
		if (isClearing || allAlerts.length === 0) return;

		isClearing = true;
		const currentIds = allAlerts.map((alert) => alert.id);

		try {
			await dismissWarningsBulk(currentIds);
			allAlerts = [];
			showingMore = false;
			alertCount.set(allAlerts.length);
		} catch (err) {
			console.error('Failed to clear all warnings:', err);
		} finally {
			isClearing = false;
		}
	}

	onMount(() => {
		getWarnings(DEMO_MAC)
			.then((rows: any[]) => {
				allAlerts = rows.map((r) => {
					const time = new Date(r.end_date || r.start_date || Date.now()).toLocaleTimeString('id-ID');
					return {
						id: r.id,
						type: 'co2-alert',
						icon: '🌫',
						time,
						msg: `Kualitas udara ${Math.round(r.value ?? r.kualitas_udara ?? 0)} (peringatan)`,
						room: String(r.mac_address ?? 'Unknown')
					} as AlertItem;
				}).reverse();
				// Update badge count
				alertCount.set(allAlerts.length);
			})
			.catch(() => {
				// keep static state if API fails
			});
	});
</script>

<div class="page-title">Alert</div>
<div class="page-sub">Peringatan kualitas udara terkini</div>

<div class="card">
	<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
		<span style="font-size:14px;font-weight:600">Peringatan Aktif</span>
		<div style="display:flex;align-items:center;gap:8px">
			<span class="alert-count-badge">{allAlerts.length} peringatan</span>
			<button class="clear-all-btn" onclick={handleClearAll} disabled={isClearing || allAlerts.length === 0}>
				{isClearing ? 'Clearing...' : 'Clear All'}
			</button>
		</div>
	</div>

	<div class="alert-list">
		{#if visibleAlerts.length > 0}
			{#each visibleAlerts as alert, idx}
				<div class="alert-item {alert.type}" style="animation-delay:{idx * 0.05}s">
					<div class="alert-icon"><span style="font-size:20px">{alert.icon}</span></div>
					<div style="flex:1">
						<div class="alert-time">{alert.time}</div>
						<div class="alert-msg">{alert.msg}</div>
						<div class="alert-room">📍 {alert.room}</div>
					</div>
					<div style="display:flex; gap:8px; align-items:center; flex-shrink:0">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5">
							<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
							<line x1="12" y1="9" x2="12" y2="13" />
						</svg>
						<button
							class="dismiss-btn"
							onclick={() => handleDismiss(alert)}
							title="Dismiss"
						>
							✕
						</button>
					</div>
				</div>
			{/each}
		{:else}
			<div class="empty-state">No data available</div>
		{/if}
	</div>

	{#if showingMore}
		<div class="hidden-alerts visible">
			{#each hiddenAlerts as alert, idx}
				<div class="alert-item {alert.type}" style="animation-delay:{idx * 0.05}s">
					<div class="alert-icon"><span style="font-size:20px">{alert.icon}</span></div>
					<div style="flex:1">
						<div class="alert-time">{alert.time}</div>
						<div class="alert-msg">{alert.msg}</div>
						<div class="alert-room">📍 {alert.room}</div>
					</div>
					<div style="display:flex; gap:8px; align-items:center; flex-shrink:0">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5">
							<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
							<line x1="12" y1="9" x2="12" y2="13" />
						</svg>
						<button
							class="dismiss-btn"
							onclick={() => handleDismiss(alert)}
							title="Dismiss"
						>
							✕
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if hiddenAlerts.length > 0}
		<button class="show-more-btn" onclick={toggleMoreAlerts}>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				style="transform: {showingMore ? 'rotate(180deg)' : 'rotate(0)'}"
			>
				<path d="M6 9l6 6 6-6" />
			</svg>
			<span>{showingMore ? 'Sembunyikan' : `Tampilkan lebih banyak (${hiddenAlerts.length})`}</span>
		</button>
	{/if}
</div>

<style>
	.page-title {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 6px;
		color: #fff;
	}

	.page-sub {
		font-size: 13px;
		color: rgba(232, 237, 248, 0.55);
		margin-bottom: 28px;
	}

	.card {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 16px;
		padding: 20px;
		backdrop-filter: blur(10px);
	}

	.alert-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 12px;
	}

	.empty-state {
		min-height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(232, 237, 248, 0.55);
		font-size: 13px;
		border: 1px dashed rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.03);
	}

	.alert-item {
		display: flex;
		align-items: center;
		gap: 16px;
		background: rgba(244, 63, 94, 0.06);
		border: 1px solid rgba(244, 63, 94, 0.2);
		border-radius: 12px;
		padding: 16px 20px;
		animation: slideIn 0.3s ease forwards;
		position: relative;
		overflow: hidden;
	}

	.alert-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: #f43f5e;
	}

	.alert-item.co2-alert::before {
		background: #a78bfa;
	}

	.alert-item.temp-alert::before {
		background: #f59e0b;
	}

	.alert-item.hum-alert::before {
		background: #38bdf8;
	}

	.alert-item.pm-alert::before {
		background: #22d6a0;
	}

	.alert-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: rgba(244, 63, 94, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.alert-time {
		font-size: 12px;
		color: rgba(232, 237, 248, 0.55);
		font-weight: 500;
	}

	.alert-msg {
		font-size: 14px;
		color: #e8edf8;
		font-weight: 500;
		margin-top: 2px;
	}

	.alert-room {
		font-size: 12px;
		color: rgba(232, 237, 248, 0.55);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.hidden-alerts {
		display: none;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 12px;
	}

	.hidden-alerts.visible {
		display: flex;
	}

	.show-more-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #e8edf8;
	}

	.dismiss-btn {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		background: rgba(244, 63, 94, 0.15);
		border: 1px solid rgba(244, 63, 94, 0.3);
		color: #f43f5e;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		font-size: 14px;
	}

	.dismiss-btn:hover {
		background: rgba(244, 63, 94, 0.25);
		border-color: rgba(244, 63, 94, 0.5);
	}

	.dismiss-btn:active {
		transform: scale(0.95);
	}

	.show-more-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px;
		border-radius: 12px;
		border: 1px dashed rgba(255, 255, 255, 0.12);
		cursor: pointer;
		color: rgba(232, 237, 248, 0.55);
		font-size: 13px;
		font-weight: 500;
		transition: all 0.2s;
		background: transparent;
		width: 100%;
		margin-top: 4px;
	}

	.show-more-btn:hover {
		background: rgba(255, 255, 255, 0.05);
		color: #e8edf8;
	}

	.alert-count-badge {
		background: rgba(244, 63, 94, 0.2);
		color: #f43f5e;
		padding: 3px 8px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 700;
	}

	.clear-all-btn {
		padding: 6px 10px;
		border-radius: 8px;
		border: 1px solid rgba(244, 63, 94, 0.4);
		background: rgba(244, 63, 94, 0.14);
		color: #fda4af;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-all-btn:hover:not(:disabled) {
		background: rgba(244, 63, 94, 0.22);
		border-color: rgba(244, 63, 94, 0.6);
		color: #ffe4e6;
	}

	.clear-all-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Tablet: 768px and down */
	@media (max-width: 768px) {
		.page-title {
			font-size: 18px;
			margin-bottom: 4px;
		}

		.page-sub {
			font-size: 12px;
			margin-bottom: 20px;
		}

		.card {
			padding: 16px;
		}

		.alert-item {
			gap: 12px;
			padding: 14px 16px;
		}

		.alert-icon {
			width: 36px;
			height: 36px;
		}

		.alert-msg {
			font-size: 13px;
		}

		.alert-time,
		.alert-room {
			font-size: 11px;
		}
	}

	/* Phone: 640px and down */
	@media (max-width: 640px) {
		.alert-item {
			gap: 10px;
			padding: 12px 14px;
		}

		.alert-icon {
			width: 32px;
			height: 32px;
		}

		.alert-msg {
			font-size: 12px;
		}

		.alert-time,
		.alert-room {
			font-size: 10px;
		}

		.show-more-btn {
			padding: 12px;
			font-size: 12px;
		}

		.alert-count-badge {
			font-size: 10px;
			padding: 2px 6px;
		}

		.card {
			padding: 12px;
		}

		.alert-list {
			gap: 10px;
		}

		.hidden-alerts {
			gap: 10px;
		}
	}

	/* Small phone: 480px and down */
	@media (max-width: 480px) {
		.alert-item {
			gap: 8px;
			padding: 10px 12px;
		}

		.alert-icon {
			width: 28px;
			height: 28px;
		}

		.alert-msg {
			font-size: 11px;
		}

		.show-more-btn {
			padding: 10px;
			font-size: 11px;
			gap: 6px;
		}

		svg {
			width: 12px;
			height: 12px;
		}

		.alert-item svg {
			width: 12px;
			height: 12px;
		}

		.dismiss-btn {
			width: 24px;
			height: 24px;
			font-size: 12px;
		}
	}
</style>
