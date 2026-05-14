<script lang="ts">
	import { onMount } from 'svelte';
	import { getWarnings, dismissWarning, dismissWarningsBulk } from '$lib/api';
	import { alertCount } from '$lib/stores';

	const DEMO_MAC = 'D4:E9:F4:8A:AF:4C';

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
	
	let visibleAlerts = $derived(allAlerts.slice(0, MAX_VISIBLE));
	let hiddenAlerts = $derived(allAlerts.slice(MAX_VISIBLE));

	let showingMore = $state(false);
	let isClearing = $state(false);

	function toggleMoreAlerts() {
		showingMore = !showingMore;
	}

	async function handleDismiss(alert: AlertItem) {
		try {
			await dismissWarning(alert.id);
			allAlerts = allAlerts.filter((a) => a.id !== alert.id);
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
					// [PERBAIKAN] Parsing tanggal sama persis seperti di History.svelte
					const rawDate = r.end_date || r.start_date;
					let timeStr = '';
					
					if (rawDate) {
						const cleanDate = rawDate.split('.')[0].replace(' ', 'T') + 'Z';
						timeStr = new Date(cleanDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
					} else {
						timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
					}

					return {
						id: r.id,
						type: 'co2-alert',
						icon: '🌫',
						time: timeStr,
						msg: `Kualitas udara ${Math.round(r.value ?? r.kualitas_udara ?? 0)} ppm (peringatan)`,
						room: String(r.mac_address ?? 'Unknown')
					} as AlertItem;
				});
				// Hapus .reverse() karena API sudah memberikan data terbaru di urutan atas (DESC)

				alertCount.set(allAlerts.length);
			})
			.catch(console.error);
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
						<button class="dismiss-btn" onclick={() => handleDismiss(alert)} title="Dismiss">✕</button>
					</div>
				</div>
			{/each}
		{:else}
			<div class="empty-state">Belum ada peringatan baru</div>
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
						<button class="dismiss-btn" onclick={() => handleDismiss(alert)} title="Dismiss">✕</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if hiddenAlerts.length > 0}
		<button class="show-more-btn" onclick={toggleMoreAlerts}>
			<span>{showingMore ? 'Sembunyikan' : `Tampilkan lebih banyak (${hiddenAlerts.length})`}</span>
		</button>
	{/if}
</div>

<style>
    /* Paste seluruh <style> lama dari Alert.svelte kamu disini agar tidak ada UI yang rusak */
	.page-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; color: #fff; }
	.page-sub { font-size: 13px; color: rgba(232, 237, 248, 0.55); margin-bottom: 28px; }
	.card { background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px); }
	.alert-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
	.empty-state { min-height: 120px; display: flex; align-items: center; justify-content: center; color: rgba(232, 237, 248, 0.55); font-size: 13px; border: 1px dashed rgba(255, 255, 255, 0.12); border-radius: 12px; background: rgba(255, 255, 255, 0.03); }
	.alert-item { display: flex; align-items: center; gap: 16px; background: rgba(244, 63, 94, 0.06); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 12px; padding: 16px 20px; position: relative; overflow: hidden; }
	.alert-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #f43f5e; }
	.alert-item.co2-alert::before { background: #a78bfa; }
	.alert-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(244, 63, 94, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
	.alert-time { font-size: 12px; color: rgba(232, 237, 248, 0.55); font-weight: 500; }
	.alert-msg { font-size: 14px; color: #e8edf8; font-weight: 500; margin-top: 2px; }
	.alert-room { font-size: 12px; color: rgba(232, 237, 248, 0.55); }
	.hidden-alerts { display: none; flex-direction: column; gap: 12px; margin-bottom: 12px; }
	.hidden-alerts.visible { display: flex; }
	.dismiss-btn { width: 28px; height: 28px; border-radius: 6px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: #f43f5e; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 14px; }
	.dismiss-btn:hover { background: rgba(244, 63, 94, 0.25); border-color: rgba(244, 63, 94, 0.5); }
	.show-more-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.12); cursor: pointer; color: rgba(232, 237, 248, 0.55); font-size: 13px; font-weight: 500; transition: all 0.2s; background: transparent; width: 100%; margin-top: 4px; }
	.show-more-btn:hover { background: rgba(255, 255, 255, 0.05); color: #e8edf8; }
	.alert-count-badge { background: rgba(244, 63, 94, 0.2); color: #f43f5e; padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; }
	.clear-all-btn { padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.14); color: #fda4af; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
	.clear-all-btn:hover:not(:disabled) { background: rgba(244, 63, 94, 0.22); border-color: rgba(244, 63, 94, 0.6); color: #ffe4e6; }
	.clear-all-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>