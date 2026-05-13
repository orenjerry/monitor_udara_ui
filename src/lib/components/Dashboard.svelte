<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	Chart.register(...registerables);

	import { getDashboard } from '$lib/api';

	const DEMO_MAC = 'D4:E9:F4:8A:AF:4C'; // Hardcoded MAC for single device

	let dashTime = $state('');
	let mainChart: Chart;
	let pieChart: Chart;
	let dashboardPollId: number | null = null;
	let dataUpdateCounter = $state(0); // Increment to trigger reactivity

	// Regular (non-reactive) chart data - updated directly
	let chartLabels: string[] = [];
	let chartSuhuData: number[] = [];
	let chartHumData: number[] = [];
	let chartCo2Data: number[] = [];

	// Reactive card values
	let tempVal = $state(33);
	let humVal = $state(78);
	let co2Val = $state(665);
	
	// Badge values from API
	let suhuBadge = $state('—');
	let humBadge = $state('—');
	let co2Badge = $state('—');

	// Derived reactive values
	let status = $derived.by(() => {
		if (!hasDashboardData) return '--';
		const v = Number(co2Val ?? 0);
		if (v >= 1000) return 'Kritis';
		if (v >= 600) return 'Warning';
		return 'Normal';
	});

	let statusClass = $derived.by(() => {
		if (status === 'Kritis') return 'badge-danger';
		if (status === 'Warning') return 'badge-warning';
		if (status === '--') return 'badge-secondary';
		return 'badge-success';
	});
	
	// Check if data ready based on update counter
	let hasDashboardData = $derived.by(() => dataUpdateCounter > 0 && chartLabels.length > 0);

	// Display values with "--" when no data
	let displaySuhu = $derived.by(() => hasDashboardData ? Math.round(tempVal) : '--');
	let displayHum = $derived.by(() => hasDashboardData ? Math.round(humVal) : '--');
	let displayCo2 = $derived.by(() => hasDashboardData ? Math.round(co2Val) : '--');

	// CO2 category and badge class based on ppm guidance
	let co2Category = $derived.by(() => {
		if (!hasDashboardData) return '--';
		const v = Number(co2Val ?? 0);
		if (v < 400) return 'Segar';
		if (v < 600) return 'Optimal';
		if (v < 1000) return 'Normal';
		if (v < 2000) return 'Pengap';
		if (v < 5000) return 'Berbahaya';
		return 'Sangat Tinggi';
	});

	let co2BadgeClass = $derived.by(() => {
		if (co2Category === '--') return 'badge-secondary';
		if (co2Category === 'Segar') return 'badge-fresh';
		if (co2Category === 'Optimal') return 'badge-optimal';
		if (co2Category === 'Normal') return 'badge-normal';
		if (co2Category === 'Pengap') return 'badge-warning';
		return 'badge-danger';
	});

	// Temperature category and badge class
	let tempCategory = $derived.by(() => {
		if (!hasDashboardData) return '--';
		const v = Number(tempVal ?? 0);
		if (v < 18) return 'Dingin';
		if (v < 22) return 'Sejuk';
		if (v < 26) return 'Nyaman';
		if (v < 30) return 'Hangat';
		return 'Panas';
	});

	let tempBadgeClass = $derived.by(() => {
		if (tempCategory === '--') return 'badge-secondary';
		if (tempCategory === 'Dingin') return 'badge-cold';
		if (tempCategory === 'Sejuk') return 'badge-cool';
		if (tempCategory === 'Nyaman') return 'badge-comfortable';
		if (tempCategory === 'Hangat') return 'badge-warm';
		return 'badge-hot';
	});

	// Humidity category and badge class
	let humCategory = $derived.by(() => {
		if (!hasDashboardData) return '--';
		const v = Number(humVal ?? 0);
		if (v < 30) return 'Kering';
		if (v < 50) return 'Nyaman';
		if (v < 70) return 'Lembab';
		return 'Sangat Lembab';
	});

	let humBadgeClass = $derived.by(() => {
		if (humCategory === '--') return 'badge-secondary';
		if (humCategory === 'Kering') return 'badge-dry';
		if (humCategory === 'Nyaman') return 'badge-comfortable';
		if (humCategory === 'Lembab') return 'badge-humid';
		return 'badge-very-humid';
	});

	function updateDashTime() {
		const now = new Date();
		dashTime = now.toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
		dashTime += ' • ' + now.toLocaleTimeString('id-ID');
	}

	function applyDashboardData(data: {
		labels: string[];
		suhuData: number[];
		humData: number[];
		co2Data: number[];
		latest?: { suhu?: number; kelembapan?: number; kualitas_udara?: number } | null;
		pie?: { suhu?: number; kelembapan?: number; kualitas_udara?: number };
		badges?: { suhu?: string; kelembapan?: string; co2?: string };
	}) {
		// Update non-reactive arrays for Chart.js
		chartLabels = [...(data.labels ?? [])];
		chartSuhuData = [...(data.suhuData ?? [])];
		chartHumData = [...(data.humData ?? [])];
		chartCo2Data = [...(data.co2Data ?? [])];

		// Update reactive card values
		if (data.latest) {
			if (data.latest.suhu !== undefined) tempVal = Number(data.latest.suhu);
			if (data.latest.kelembapan !== undefined) humVal = Number(data.latest.kelembapan);
			if (data.latest.kualitas_udara !== undefined) co2Val = Number(data.latest.kualitas_udara);
		}
		
		// Update badge values from API
		if (data.badges) {
			if (data.badges.suhu !== undefined) suhuBadge = data.badges.suhu;
			if (data.badges.kelembapan !== undefined) humBadge = data.badges.kelembapan;
			if (data.badges.co2 !== undefined) co2Badge = data.badges.co2;
		}

		// if canvases were not present during initial mount (no data yet), initialize charts now
		if (!mainChart && document.getElementById('mainChart')) {
			initMainChart();
		}
		if (!pieChart && document.getElementById('pieChart')) {
			initPieChart();
		}

		// Update charts with new data
		if (mainChart) {
			mainChart.data.labels = [...chartLabels];
			mainChart.data.datasets[0].data = [...chartSuhuData];
			mainChart.data.datasets[1].data = [...chartHumData];
			mainChart.data.datasets[2].data = chartCo2Data.map((v) => v / 10);
			mainChart.update();
		}

		if (pieChart && data.pie) {
			pieChart.data.datasets[0].data = [
				Number(data.pie.suhu ?? 0),
				Number(data.pie.kelembapan ?? 0),
				Number(data.pie.kualitas_udara ?? 0)
			];
			pieChart.update();
		}

		// Increment counter to trigger reactivity
		dataUpdateCounter++;
	}

	function initMainChart() {
		const canvas = document.getElementById('mainChart') as HTMLCanvasElement;
		if (!canvas) return;

		if (mainChart) mainChart.destroy();

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		mainChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: chartLabels,
				datasets: [
					{
						label: 'Suhu',
						data: chartSuhuData,
						borderColor: '#f59e0b',
						backgroundColor: 'rgba(245,158,11,0.05)',
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 3,
						pointBackgroundColor: '#f59e0b'
					},
					{
						label: 'Kelembapan',
						data: chartHumData,
						borderColor: '#38bdf8',
						backgroundColor: 'rgba(56,189,248,0.05)',
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 3,
						pointBackgroundColor: '#38bdf8'
					},
					{
						label: 'CO₂ (/10)',
						data: chartCo2Data.map((v) => v / 10),
						borderColor: '#22d6a0',
						backgroundColor: 'rgba(34,214,160,0.05)',
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 3,
						pointBackgroundColor: '#22d6a0'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				scales: {
					x: {
						grid: { color: 'rgba(255,255,255,0.04)' },
						ticks: { color: 'rgba(232,237,248,0.5)', font: { size: 10 } }
					},
					y: {
						grid: { color: 'rgba(255,255,255,0.04)' },
						ticks: { color: 'rgba(232,237,248,0.5)', font: { size: 10 } }
					}
				}
			}
		});
	}

	function initPieChart() {
		const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
		if (!canvas) return;

		if (pieChart) pieChart.destroy();

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		pieChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: ['Suhu', 'Kelembapan', 'CO₂'],
				datasets: [
					{
						data: [tempVal, humVal, co2Val],
						backgroundColor: ['#f59e0b', '#38bdf8', '#22d6a0'],
						borderColor: 'rgba(1,1,63,0.8)',
						borderWidth: 3
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				cutout: '60%'
			}
		});
	}

	onMount(() => {
		updateDashTime();

	    getDashboard(DEMO_MAC)
			.then((data) => {
				applyDashboardData(data);
			})
			.catch(() => {
				// keep empty state if API fails
			});

		setTimeout(() => {
			initMainChart();
			initPieChart();

			// start polling dashboard data every 5s
			dashboardPollId = window.setInterval(() => {
				getDashboard(DEMO_MAC)
					.then((data) => {
						applyDashboardData(data);
					})
					.catch(() => {});
			}, 2000) as unknown as number;
		}, 100);

		const timeInterval = setInterval(updateDashTime, 1000);

		return () => {
			clearInterval(timeInterval);
			if (dashboardPollId) {
				clearInterval(dashboardPollId as number);
				dashboardPollId = null;
			}
			if (mainChart) mainChart.destroy();
			if (pieChart) pieChart.destroy();
		};
	});
</script>

<div class="page-title">Dashboard</div>
<div class="page-sub">{dashTime}</div>

<div class="stats-grid">
	<div class="stat-card temp">
		<div class="stat-label">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"
				><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>
			Suhu
		</div>
		<div class="stat-value">{displaySuhu}<span class="stat-unit">°C</span></div>
		<div class="stat-badge {tempBadgeClass}">{tempCategory}</div>
	</div>
	<div class="stat-card hum">
		<div class="stat-label">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"
				><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
			Kelembapan
		</div>
		<div class="stat-value">{displayHum}<span class="stat-unit">%</span></div>
		<div class="stat-badge {humBadgeClass}">{humCategory}</div>
	</div>
	<div class="stat-card co2">
		<div class="stat-label">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5"
				><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
			CO₂
		</div>
		<div class="stat-value">{displayCo2}<span class="stat-unit"> ppm</span></div>
		<div class="stat-badge {co2BadgeClass}">{co2Category}</div>
	</div>
	<div class="stat-card status">
		<div class="stat-label">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"
				><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
			Status
		</div>
		<div class="stat-badge {statusClass}" style="font-size:13px;padding:6px 12px">{status}</div>
		<div style="font-size:11px;color:rgba(232,237,248,0.55);margin-top:8px;line-height:1.5">
			{#if status === 'Normal'}Kondisi normal.
			{:else if status === 'Warning'}CO₂ melebihi batas aman. Ventilasi diperlukan.
			{:else if status === '--'}Data belum tersedia.
			{:else}CO₂ pada level kritis — segera ambil tindakan.
			{/if}
		</div>
	</div>
</div>

<div class="charts-row">
	<div class="card">
		<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
			<span style="font-size:14px;font-weight:600">Tren Real-time</span>
			<span style="font-size:11px;color:rgba(232,237,248,0.55)">Live • Update tiap 2 detik</span>
		</div>
		<div class="legend">
			<div style="display:flex;align-items:center;gap:5px"><div class="legend-dot" style="background:#f59e0b"></div>Suhu</div>
			<div style="display:flex;align-items:center;gap:5px"><div class="legend-dot" style="background:#38bdf8"></div>Kelembapan</div>
			<div style="display:flex;align-items:center;gap:5px"><div class="legend-dot" style="background:#22d6a0"></div>CO₂ (/10)</div>
		</div>
		{#if hasDashboardData}
			<div class="chart-wrap"><canvas id="mainChart"></canvas></div>
		{:else}
			<div class="empty-state">No data available</div>
		{/if}
	</div>
	<div class="card" style="display:flex;flex-direction:column;justify-content:space-between">
		<div style="font-size:14px;font-weight:600;margin-bottom:12px">Distribusi Rata-rata</div>
		{#if hasDashboardData}
			<div style="position:relative;height:160px"><canvas id="pieChart"></canvas></div>
		{:else}
			<div class="empty-state pie-empty">No data available</div>
		{/if}
		<div class="legend" style="margin-top:12px;justify-content:flex-start;flex-direction:column;gap:8px">
			<div style="display:flex;align-items:center;gap:6px"><div class="legend-dot" style="background:#f59e0b"></div><span style="font-size:12px">Suhu — {displaySuhu}°C</span></div>
			<div style="display:flex;align-items:center;gap:6px"><div class="legend-dot" style="background:#38bdf8"></div><span style="font-size:12px">Kelembapan — {displayHum}%</span></div>
			<div style="display:flex;align-items:center;gap:6px"><div class="legend-dot" style="background:#22d6a0;margin-left:0"></div><span style="font-size:12px;margin-left:6px">CO₂ — {displayCo2} ppm</span></div>
		</div>
	</div>
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

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-bottom: 20px;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 18px 20px;
		position: relative;
		overflow: hidden;
	}

	.stat-card::before {
		content: '';
		position: absolute;
		top: -30px;
		right: -30px;
		width: 80px;
		height: 80px;
		border-radius: 50%;
		opacity: 0.08;
	}

	.stat-card.temp::before {
		background: #f59e0b;
	}

	.stat-card.hum::before {
		background: #38bdf8;
	}

	.stat-card.co2::before {
		background: #a78bfa;
	}

	.stat-card.status::before {
		background: #f43f5e;
	}

	.stat-label {
		font-size: 12px;
		color: rgba(232, 237, 248, 0.55);
		margin-bottom: 8px;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		color: #fff;
		line-height: 1;
	}

	.stat-unit {
		font-size: 14px;
		font-weight: 400;
		color: rgba(232, 237, 248, 0.55);
	}

	.stat-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 10px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 600;
		margin-top: 8px;
	}

	.badge-warning {
		background: rgba(245, 158, 11, 0.2);
		color: #f59e0b;
	}

	.badge-danger {
		background: rgba(244, 63, 94, 0.2);
		color: #f43f5e;
	}

	.badge-success {
		background: rgba(34, 214, 160, 0.2);
		color: #22d6a0;
	}

	/* Additional CO2 badge colors */
	.badge-fresh {
		background: rgba(34, 214, 160, 0.12);
		color: #16a34a;
	}

	.badge-optimal {
		background: rgba(56, 189, 248, 0.08);
		color: #06b6d4;
	}

	.badge-normal {
		background: rgba(245, 158, 11, 0.08);
		color: #b45309;
	}

	/* Temperature badge colors */
	.badge-cold {
		background: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
	}

	.badge-cool {
		background: rgba(34, 211, 238, 0.2);
		color: #06b6d4;
	}

	.badge-comfortable {
		background: rgba(34, 214, 160, 0.2);
		color: #10b981;
	}

	.badge-warm {
		background: rgba(251, 146, 60, 0.2);
		color: #fb923c;
	}

	.badge-hot {
		background: rgba(244, 63, 94, 0.2);
		color: #ef4444;
	}

	/* Humidity badge colors */
	.badge-dry {
		background: rgba(234, 179, 8, 0.2);
		color: #eab308;
	}

	.badge-humid {
		background: rgba(56, 189, 248, 0.2);
		color: #0284c7;
	}

	.badge-very-humid {
		background: rgba(168, 85, 247, 0.2);
		color: #a855f7;
	}

	.badge-secondary {
		background: rgba(232, 237, 248, 0.1);
		color: rgba(232, 237, 248, 0.55);
	}

	.charts-row {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 16px;
	}

	.chart-wrap {
		position: relative;
		height: 260px;
	}

	.empty-state {
		min-height: 260px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(232, 237, 248, 0.55);
		font-size: 13px;
		border: 1px dashed rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.03);
	}

	.pie-empty {
		height: 160px;
		min-height: 160px;
	}

	.legend {
		display: flex;
		gap: 16px;
		font-size: 12px;
		color: rgba(232, 237, 248, 0.55);
		margin-bottom: 8px;
		justify-content: center;
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 2px;
		flex-shrink: 0;
		margin-top: 2px;
	}

	/* Tablet: 768px and down */
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
			margin-bottom: 16px;
		}

		.stat-card {
			padding: 14px 16px;
		}

		.stat-value {
			font-size: 24px;
		}

		.stat-label {
			font-size: 11px;
			margin-bottom: 6px;
		}

		.stat-unit {
			font-size: 12px;
		}

		.charts-row {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.chart-wrap {
			height: 220px;
		}

		.empty-state {
			min-height: 220px;
		}

		.page-title {
			font-size: 18px;
			margin-bottom: 4px;
		}

		.page-sub {
			font-size: 12px;
			margin-bottom: 20px;
		}

		.legend {
			gap: 12px;
			font-size: 11px;
		}

		.card {
			padding: 16px;
		}
	}

	/* Phone: 480px and down */
	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
			gap: 10px;
			margin-bottom: 12px;
		}

		.stat-card {
			padding: 12px 14px;
		}

		.stat-value {
			font-size: 20px;
		}

		.stat-label {
			font-size: 10px;
			margin-bottom: 4px;
			gap: 4px;
		}

		.stat-label svg {
			width: 12px;
			height: 12px;
		}

		.stat-unit {
			font-size: 11px;
		}

		.stat-badge {
			padding: 3px 8px;
			font-size: 10px;
			margin-top: 6px;
		}

		.charts-row {
			grid-template-columns: 1fr;
			gap: 10px;
		}

		.chart-wrap {
			height: 180px;
		}

		.empty-state {
			min-height: 180px;
			font-size: 12px;
		}

		.pie-empty {
			height: 140px;
			min-height: 140px;
		}

		.page-title {
			font-size: 16px;
			margin-bottom: 2px;
		}

		.page-sub {
			font-size: 11px;
			margin-bottom: 16px;
		}

		.card {
			padding: 12px;
			border-radius: 12px;
		}

		.legend {
			gap: 10px;
			font-size: 10px;
			flex-direction: column;
			margin-bottom: 6px;
		}

		.legend-dot {
			width: 8px;
			height: 8px;
			margin-top: 1px;
		}

		.stat-card::before {
			width: 60px;
			height: 60px;
		}
	}
</style>
