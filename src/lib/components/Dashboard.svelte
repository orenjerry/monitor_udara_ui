<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	Chart.register(...registerables);

	let dashTime = $state('');
	let mainChart: Chart;
	let pieChart: Chart;

	let labels: string[] = [];
	let suhuData: number[] = [];
	let humData: number[] = [];
	let co2Data: number[] = [];

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

	function generateChartData() {
		labels = [];
		suhuData = [];
		humData = [];
		co2Data = [];

		for (let i = 10; i >= 0; i--) {
			const t = new Date(Date.now() - i * 300000);
			labels.push(t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
			suhuData.push(32 + Math.random() * 2);
			humData.push(75 + Math.random() * 6);
			co2Data.push(600 + Math.random() * 120);
		}
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
				labels,
				datasets: [
					{
						label: 'Suhu',
						data: suhuData,
						borderColor: '#f59e0b',
						backgroundColor: 'rgba(245,158,11,0.05)',
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 3,
						pointBackgroundColor: '#f59e0b'
					},
					{
						label: 'Kelembapan',
						data: humData,
						borderColor: '#38bdf8',
						backgroundColor: 'rgba(56,189,248,0.05)',
						tension: 0.4,
						borderWidth: 2,
						pointRadius: 3,
						pointBackgroundColor: '#38bdf8'
					},
					{
						label: 'CO₂ (/10)',
						data: co2Data.map((v) => v / 10),
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
						data: [33, 78, 66.5],
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
		generateChartData();

		setTimeout(() => {
			initMainChart();
			initPieChart();
		}, 100);

		const timeInterval = setInterval(updateDashTime, 1000);
		const chartInterval = setInterval(() => {
			const t = new Date();
			labels.shift();
			labels.push(t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
			suhuData.shift();
			suhuData.push(32 + Math.random() * 2);
			humData.shift();
			humData.push(75 + Math.random() * 6);
			co2Data.shift();
			co2Data.push(600 + Math.random() * 120);

			if (mainChart) {
				mainChart.data.labels = [...labels];
				mainChart.data.datasets[0].data = [...suhuData];
				mainChart.data.datasets[1].data = [...humData];
				mainChart.data.datasets[2].data = co2Data.map((v) => v / 10);
				mainChart.update('none');
			}
		}, 5000);

		return () => {
			clearInterval(timeInterval);
			clearInterval(chartInterval);
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
		<div class="stat-value">33<span class="stat-unit">°C</span></div>
		<div class="stat-badge badge-warning">▲ +1.2° dari avg</div>
	</div>
	<div class="stat-card hum">
		<div class="stat-label">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"
				><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
			Kelembapan
		</div>
		<div class="stat-value">78<span class="stat-unit">%</span></div>
		<div class="stat-badge badge-warning">▲ Sedikit tinggi</div>
	</div>
	<div class="stat-card co2">
		<div class="stat-label">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5"
				><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
			CO₂
		</div>
		<div class="stat-value">665<span class="stat-unit"> ppm</span></div>
		<div class="stat-badge badge-danger">⚠ Alert Level</div>
	</div>
	<div class="stat-card status">
		<div class="stat-label">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"
				><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
			Status
		</div>
		<div class="stat-badge badge-danger" style="font-size:13px;padding:6px 12px">Warning</div>
		<div style="font-size:11px;color:rgba(232,237,248,0.55);margin-top:8px;line-height:1.5">CO₂ melebihi batas aman. Ventilasi diperlukan.</div>
	</div>
</div>

<div class="charts-row">
	<div class="card">
		<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
			<span style="font-size:14px;font-weight:600">Tren Real-time</span>
			<span style="font-size:11px;color:rgba(232,237,248,0.55)">Live • Update tiap 5 detik</span>
		</div>
		<div class="legend">
			<div style="display:flex;align-items:center;gap:5px"><div class="legend-dot" style="background:#f59e0b"></div>Suhu</div>
			<div style="display:flex;align-items:center;gap:5px"><div class="legend-dot" style="background:#38bdf8"></div>Kelembapan</div>
			<div style="display:flex;align-items:center;gap:5px"><div class="legend-dot" style="background:#22d6a0"></div>CO₂ (/10)</div>
		</div>
		<div class="chart-wrap"><canvas id="mainChart"></canvas></div>
	</div>
	<div class="card" style="display:flex;flex-direction:column;justify-content:space-between">
		<div style="font-size:14px;font-weight:600;margin-bottom:12px">Distribusi Rata-rata</div>
		<div style="position:relative;height:160px"><canvas id="pieChart"></canvas></div>
		<div class="legend" style="margin-top:12px;justify-content:flex-start;flex-direction:column;gap:8px">
			<div style="display:flex;align-items:center;gap:6px"><div class="legend-dot" style="background:#f59e0b"></div><span style="font-size:12px">Suhu — 33°C</span></div>
			<div style="display:flex;align-items:center;gap:6px"><div class="legend-dot" style="background:#38bdf8"></div><span style="font-size:12px">Kelembapan — 78%</span></div>
			<div style="display:flex;align-items:center;gap:6px"><div class="legend-dot" style="background:#22d6a0;margin-left:0"></div><span style="font-size:12px;margin-left:6px">CO₂ — 665 ppm</span></div>
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

	.charts-row {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 16px;
	}

	.chart-wrap {
		position: relative;
		height: 260px;
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
</style>
