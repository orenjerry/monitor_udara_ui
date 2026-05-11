<script lang="ts">
	interface AlertItem {
		type: 'co2-alert' | 'temp-alert' | 'hum-alert' | 'pm-alert';
		icon: string;
		time: string;
		msg: string;
		room: string;
	}

	const allAlerts: AlertItem[] = [
		{
			type: 'co2-alert',
			icon: '🌫',
			time: '07:05:34',
			msg: 'CO₂ level di 685 ppm (Alert Level)',
			room: 'Room B'
		},
		{
			type: 'temp-alert',
			icon: '🌡',
			time: '07:02:02',
			msg: 'Suhu di 33.8°C (Melebihi Batas)',
			room: 'Server Room'
		},
		{
			type: 'hum-alert',
			icon: '💧',
			time: '06:34:55',
			msg: 'Kelembapan di 81% (Alert Level)',
			room: 'Room C'
		},
		{
			type: 'pm-alert',
			icon: '🌿',
			time: '06:01:23',
			msg: 'PM2.5 level tinggi 45 μg/m³',
			room: 'Front Office'
		},
		{
			type: 'co2-alert',
			icon: '🌫',
			time: '05:48:10',
			msg: 'CO₂ level di 710 ppm (Alert Level)',
			room: 'Meeting Room'
		},
		{
			type: 'temp-alert',
			icon: '🌡',
			time: '05:22:44',
			msg: 'Suhu di 35°C (Kritis)',
			room: 'Data Center'
		},
		{
			type: 'hum-alert',
			icon: '💧',
			time: '04:55:30',
			msg: 'Kelembapan di 88% (Sangat Tinggi)',
			room: 'Warehouse'
		}
	];

	const MAX_VISIBLE = 4;
	const visibleAlerts = allAlerts.slice(0, MAX_VISIBLE);
	const hiddenAlerts = allAlerts.slice(MAX_VISIBLE);

	let showingMore = $state(false);

	function toggleMoreAlerts() {
		showingMore = !showingMore;
	}
</script>

<div class="page-title">Alert</div>
<div class="page-sub">Peringatan kualitas udara terkini</div>

<div class="card">
	<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
		<span style="font-size:14px;font-weight:600">Peringatan Aktif</span>
		<span class="alert-count-badge">{allAlerts.length} peringatan</span>
	</div>

	<div class="alert-list">
		{#each visibleAlerts as alert, idx}
			<div class="alert-item {alert.type}" style="animation-delay:{idx * 0.05}s">
				<div class="alert-icon"><span style="font-size:20px">{alert.icon}</span></div>
				<div style="flex:1">
					<div class="alert-time">{alert.time}</div>
					<div class="alert-msg">{alert.msg}</div>
					<div class="alert-room">📍 {alert.room}</div>
				</div>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5">
					<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
					<line x1="12" y1="9" x2="12" y2="13" />
				</svg>
			</div>
		{/each}
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
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5">
						<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
						<line x1="12" y1="9" x2="12" y2="13" />
					</svg>
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
</style>
