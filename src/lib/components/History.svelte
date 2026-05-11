<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js';

	let calYear = 2026;
	let calMonth = 4; // May (0-indexed)
	let selectedDay: number | null = null;
	let detailChartInst: Chart | null = null;

	interface DayData {
		suhu: number;
		hum: number;
		co2: number;
	}

	function seededRand(seed: number) {
		let s = seed;
		return () => {
			s = (s * 1664525 + 1013904223) % 4294967296;
			return s / 4294967296;
		};
	}

	function getMonthData(year: number, month: number): Record<number, DayData> {
		const r = seededRand(year * 100 + month);
		const days = new Date(year, month + 1, 0).getDate();
		const data: Record<number, DayData> = {};
		for (let d = 1; d <= days; d++) {
			data[d] = {
				suhu: 29 + Math.floor(r() * 8),
				hum: 60 + Math.floor(r() * 25),
				co2: 500 + Math.floor(r() * 300)
			};
		}
		return data;
	}

	function renderCalendar() {
		const monthNames = [
			'Januari',
			'Februari',
			'Maret',
			'April',
			'Mei',
			'Juni',
			'Juli',
			'Agustus',
			'September',
			'Oktober',
			'November',
			'Desember'
		];

		const data = getMonthData(calYear, calMonth);
		const firstDay = new Date(calYear, calMonth, 1).getDay();
		const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
		const daysInPrev = new Date(calYear, calMonth, 0).getDate();

		const today = new Date();
		let cells: Array<{ day: number; other: boolean; data?: DayData }> = [];

		for (let i = firstDay - 1; i >= 0; i--) {
			cells.push({ day: daysInPrev - i, other: true });
		}
		for (let d = 1; d <= daysInMonth; d++) {
			cells.push({ day: d, other: false, data: data[d] });
		}
		while (cells.length % 7 !== 0) {
			cells.push({ day: cells.length - firstDay - daysInMonth + 1, other: true });
		}

		return {
			monthLabel: `${monthNames[calMonth]} ${calYear}`,
			cells,
			today
		};
	}

	function changeMonth(dir: number) {
		calMonth += dir;
		if (calMonth > 11) {
			calMonth = 0;
			calYear++;
		}
		if (calMonth < 0) {
			calMonth = 11;
			calYear--;
		}
		selectedDay = null;
	}

	function showDayDetail(day: number, dayData: DayData) {
		selectedDay = day;

		const monthNames = [
			'Januari',
			'Februari',
			'Maret',
			'April',
			'Mei',
			'Juni',
			'Juli',
			'Agustus',
			'September',
			'Oktober',
			'November',
			'Desember'
		];
		const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

		const r = seededRand(calYear * 10000 + calMonth * 100 + day);
		const hrs = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
		const suhuH = hrs.map(() => dayData.suhu - 3 + Math.floor(r() * 8));
		const humH = hrs.map(() => dayData.hum - 10 + Math.floor(r() * 20));
		const co2H = hrs.map(() => dayData.co2 - 100 + Math.floor(r() * 200));

		if (detailChartInst) detailChartInst.destroy();

		const canvas = document.getElementById('detailChart') as HTMLCanvasElement;
		if (!canvas) return;

		const dc = canvas.getContext('2d');
		if (!dc) return;

		detailChartInst = new Chart(dc, {
			type: 'line',
			data: {
				labels: hrs,
				datasets: [
					{
						label: 'Suhu',
						data: suhuH,
						borderColor: '#f59e0b',
						tension: 0.4,
						borderWidth: 2,
						fill: false,
						pointRadius: 2
					},
					{
						label: 'Kelembapan',
						data: humH,
						borderColor: '#38bdf8',
						tension: 0.4,
						borderWidth: 2,
						fill: true,
						backgroundColor: 'rgba(56,189,248,0.08)',
						pointRadius: 2
					},
					{
						label: 'CO₂ (/10)',
						data: co2H.map((v) => v / 10),
						borderColor: '#22d6a0',
						tension: 0.4,
						borderWidth: 2,
						fill: false,
						pointRadius: 2
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
						ticks: { color: 'rgba(232,237,248,0.5)', font: { size: 9 } }
					},
					y: {
						grid: { color: 'rgba(255,255,255,0.04)' },
						ticks: { color: 'rgba(232,237,248,0.5)', font: { size: 9 } }
					}
				}
			}
		});
	}

	let calendarData = $derived(renderCalendar());

	onMount(() => {
		const monthNames = [
			'Januari',
			'Februari',
			'Maret',
			'April',
			'Mei',
			'Juni',
			'Juli',
			'Agustus',
			'September',
			'Oktober',
			'November',
			'Desember'
		];
		const headers = document.getElementById('cal-headers');
		if (headers) {
			headers.innerHTML = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
				.map((h) => `<div class="cal-header">${h}</div>`)
				.join('');
		}
	});
</script>

<div class="page-title">Riwayat Data Udara</div>
<div class="page-sub">{calendarData.monthLabel}</div>

<div class="history-layout">
	<div class="card">
		<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
			<button onclick={() => changeMonth(-1)} class="month-btn">‹</button>
			<span style="font-size:15px;font-weight:600">{calendarData.monthLabel}</span>
			<button onclick={() => changeMonth(1)} class="month-btn">›</button>
		</div>

		<div class="calendar-grid" id="cal-headers"></div>
		<div class="calendar-grid" style="margin-top:4px">
			{#each calendarData.cells as cell}
				<div
					class="cal-day {cell.other ? 'other-month' : ''} {selectedDay === cell.day && !cell.other ? 'selected' : ''}"
					onclick={() => !cell.other && cell.data && showDayDetail(cell.day, cell.data)}
					role="button"
					tabindex="0"
				>
					<div class="day-num">{cell.day}</div>
					{#if !cell.other && cell.data}
						<div class="day-bars">
							<div class="day-bar" style="height:{Math.round((cell.data.suhu / 40) * 24)}px;background:#f59e0b"></div>
							<div class="day-bar" style="height:{Math.round((cell.data.hum / 100) * 24)}px;background:#38bdf8"></div>
							<div class="day-bar" style="height:{Math.round((cell.data.co2 / 900) * 24)}px;background:#22d6a0"></div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div style="display:flex;gap:16px;margin-top:12px;justify-content:center">
			<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(232,237,248,0.55)">
				<div style="width:8px;height:8px;background:#f59e0b;border-radius:1px"></div>Suhu
			</div>
			<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(232,237,248,0.55)">
				<div style="width:8px;height:8px;background:#38bdf8;border-radius:1px"></div>Kelembapan
			</div>
			<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(232,237,248,0.55)">
				<div style="width:8px;height:8px;background:#22d6a0;border-radius:1px"></div>CO₂
			</div>
		</div>
	</div>

	<div>
		<div class="card" style="margin-bottom:16px">
			<div style="font-size:14px;font-weight:600;margin-bottom:14px">
				{#if selectedDay}
					Detail Data — {selectedDay}
				{:else}
					Detail Data — Pilih tanggal
				{/if}
			</div>
			<div class="detail-stats">
				<div class="detail-stat">
					<div class="detail-stat-label">Suhu</div>
					<div class="detail-stat-val">{selectedDay && calendarData.cells.find((c) => c.day === selectedDay && !c.other) ? calendarData.cells.find((c) => c.day === selectedDay && !c.other)?.data?.suhu + '°C' : '—'}</div>
					<div style="font-size:10px;color:rgba(232,237,248,0.55)">Avg</div>
				</div>
				<div class="detail-stat">
					<div class="detail-stat-label">Kelembapan</div>
					<div class="detail-stat-val">{selectedDay && calendarData.cells.find((c) => c.day === selectedDay && !c.other) ? calendarData.cells.find((c) => c.day === selectedDay && !c.other)?.data?.hum + '%' : '—'}</div>
					<div style="font-size:10px;color:rgba(232,237,248,0.55)">Avg</div>
				</div>
				<div class="detail-stat">
					<div class="detail-stat-label">CO₂</div>
					<div class="detail-stat-val">{selectedDay && calendarData.cells.find((c) => c.day === selectedDay && !c.other) ? calendarData.cells.find((c) => c.day === selectedDay && !c.other)?.data?.co2 + ' ppm' : '—'}</div>
					<div style="font-size:10px;color:rgba(232,237,248,0.55)">Avg</div>
				</div>
			</div>
		</div>
		<div class="card">
			<div style="font-size:13px;font-weight:600;margin-bottom:10px">Grafik Harian</div>
			<div class="detail-chart-wrap"><canvas id="detailChart"></canvas></div>
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

	.history-layout {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 20px;
	}

	.month-btn {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: #e8edf8;
		border-radius: 8px;
		padding: 6px 12px;
		cursor: pointer;
		font-size: 13px;
		transition: all 0.2s;
	}

	.month-btn:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}

	.cal-header {
		text-align: center;
		font-size: 11px;
		font-weight: 600;
		color: rgba(232, 237, 248, 0.55);
		padding: 6px 2px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.cal-day {
		border-radius: 8px;
		padding: 6px 4px;
		cursor: pointer;
		transition: all 0.2s;
		min-height: 64px;
		border: 1px solid transparent;
	}

	.cal-day:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.12);
	}

	.cal-day.selected {
		background: rgba(79, 142, 247, 0.25);
		border-color: #4f8ef7;
	}

	.cal-day.other-month .day-num {
		color: rgba(232, 237, 248, 0.55);
		opacity: 0.4;
	}

	.day-num {
		font-size: 12px;
		font-weight: 600;
		margin-bottom: 4px;
		color: #e8edf8;
	}

	.day-bars {
		display: flex;
		gap: 2px;
		align-items: flex-end;
		height: 28px;
	}

	.day-bar {
		width: 7px;
		border-radius: 2px;
		transition: height 0.3s;
	}

	.detail-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 16px;
	}

	.detail-stat {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		padding: 12px;
		text-align: center;
	}

	.detail-stat-label {
		font-size: 11px;
		color: rgba(232, 237, 248, 0.55);
		margin-bottom: 4px;
	}

	.detail-stat-val {
		font-size: 18px;
		font-weight: 700;
		color: #fff;
	}

	.detail-chart-wrap {
		height: 180px;
		position: relative;
	}
</style>
