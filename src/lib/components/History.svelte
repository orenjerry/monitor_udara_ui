<script lang="ts">
	import { Chart } from 'chart.js';
	import { onMount } from 'svelte';
	import { getHistory } from '$lib/api';

	const DEMO_MAC = 'd4:e9:f4:8a:af:4c'; // Hardcoded MAC for single device

	type DayData = {
		suhu: number;
		hum: number;
		co2: number;
	};

	type CalendarCell = {
		day: number;
		other: boolean;
		data?: DayData;
	};

	let calYear = $state(new Date().getFullYear());
	let calMonth = $state(new Date().getMonth());
	let selectedDay = $state<number | null>(null);
	let detailChartInst: Chart | null = null;

	const monthNames = [
		'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
	];
	const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

	// historyMap keyed by ISO date 'YYYY-MM-DD'
	let historyMap: Record<string, DayData> = {};
	let hasHistoryData = $derived.by(() => Object.keys(historyMap).length > 0);

	onMount(() => {
		getHistory(DEMO_MAC)
			.then((rows: any[]) => {
				// aggregate by date
				const accum: Record<string, { s: number; h: number; c: number; n: number }> = {};
				for (const r of rows) {
					const dt = new Date(r.end_date || r.start_date || Date.now());
					const key = dt.toISOString().slice(0, 10);
					if (!accum[key]) accum[key] = { s: 0, h: 0, c: 0, n: 0 };
					accum[key].s += Number(r.suhu ?? r.kelembapan ?? 0) || Number(r.suhu ?? 0);
					// API stores kelembapan and kualitas_udara separately
					accum[key].h += Number(r.kelembapan ?? 0);
					accum[key].c += Number(r.kualitas_udara ?? r.value ?? 0);
					accum[key].n += 1;
				}

				for (const k of Object.keys(accum)) {
					const a = accum[k];
					historyMap[k] = {
						suhu: Math.round((a.s / a.n) || 0),
						hum: Math.round((a.h / a.n) || 0),
						co2: Math.round((a.c / a.n) || 0)
					};
				}
			})
			.catch(() => {
				// keep calendar with fallback random data if API fails
			});
	});

	function getMonthData(year: number, month: number): Record<number, DayData> {
		const days = new Date(year, month + 1, 0).getDate();
		const data: Record<number, DayData> = {};

		for (let day = 1; day <= days; day++) {
			const dt = new Date(year, month, day);
			const key = dt.toISOString().slice(0, 10);
			if (historyMap[key]) {
				data[day] = historyMap[key];
			} else {
				data[day] = undefined as unknown as DayData;
			}
		}

		return data;
	}

	function renderCalendar() {
		const data = getMonthData(calYear, calMonth);
		const firstDay = new Date(calYear, calMonth, 1).getDay();
		const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
		const daysInPrev = new Date(calYear, calMonth, 0).getDate();
		const cells: CalendarCell[] = [];

		for (let index = firstDay - 1; index >= 0; index--) {
			cells.push({ day: daysInPrev - index, other: true });
		}

		for (let day = 1; day <= daysInMonth; day++) {
			cells.push({ day, other: false, data: data[day] });
		}

		while (cells.length % 7 !== 0) {
			cells.push({ day: cells.length - firstDay - daysInMonth + 1, other: true });
		}

		return {
			monthLabel: `${monthNames[calMonth]} ${calYear}`,
			cells
		};
	}

	function changeMonth(direction: number) {
		calMonth += direction;
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

		const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
		const r = () => Math.random();
		const suhuSeries = hours.map(() => dayData.suhu - 2 + Math.floor(r() * 6));
		const humSeries = hours.map(() => dayData.hum - 6 + Math.floor(r() * 12));
		const co2Series = hours.map(() => dayData.co2 - 80 + Math.floor(r() * 160));

		if (detailChartInst) {
			detailChartInst.destroy();
		}

		const canvas = document.getElementById('detailChart') as HTMLCanvasElement | null;
		if (!canvas) {
			return;
		}

		const context = canvas.getContext('2d');
		if (!context) {
			return;
		}

		detailChartInst = new Chart(context, {
			type: 'line',
			data: {
				labels: hours,
				datasets: [
					{
						label: 'Suhu',
						data: suhuSeries,
						borderColor: '#f59e0b',
						tension: 0.4,
						borderWidth: 2,
						fill: false,
						pointRadius: 2
					},
					{
						label: 'Kelembapan',
						data: humSeries,
						borderColor: '#38bdf8',
						tension: 0.4,
						borderWidth: 2,
						fill: true,
						backgroundColor: 'rgba(56,189,248,0.08)',
						pointRadius: 2
					},
					{
						label: 'CO₂ (/10)',
						data: co2Series.map((value) => value / 10),
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

	let calendarData = $derived.by(() => renderCalendar());
	let selectedCell = $derived.by(() => calendarData.cells.find((cell) => cell.day === selectedDay && !cell.other));
</script>

<div class="page-title">Riwayat Data Udara</div>
<div class="page-sub">{calendarData.monthLabel}</div>

<div class="history-layout">
	<div class="card">
		<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
			<button type="button" onclick={() => changeMonth(-1)} class="month-btn">‹</button>
			<span style="font-size:15px;font-weight:600">{calendarData.monthLabel}</span>
			<button type="button" onclick={() => changeMonth(1)} class="month-btn">›</button>
		</div>

		{#if !hasHistoryData}
			<div class="empty-state">No data available</div>
		{:else}

		<div class="calendar-grid">
			{#each dayNames as dayName}
				<div class="cal-header">{dayName}</div>
			{/each}
		</div>
		<div class="calendar-grid" style="margin-top:4px">
			{#each calendarData.cells as cell}
				<button
					type="button"
					class="cal-day {cell.other ? 'other-month' : ''} {selectedDay === cell.day && !cell.other ? 'selected' : ''}"
					onclick={() => !cell.other && cell.data && showDayDetail(cell.day, cell.data)}
					disabled={cell.other || !cell.data}
				>
					<div class="day-num">{cell.day}</div>
					{#if !cell.other && cell.data}
						<div class="day-bars">
							<div class="day-bar" style="height:{Math.round((cell.data.suhu / 40) * 24)}px;background:#f59e0b"></div>
							<div class="day-bar" style="height:{Math.round((cell.data.hum / 100) * 24)}px;background:#38bdf8"></div>
							<div class="day-bar" style="height:{Math.round((cell.data.co2 / 900) * 24)}px;background:#22d6a0"></div>
						</div>
					{/if}
				</button>
			{/each}
		</div>
		{/if}

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
					<div class="detail-stat-val">{selectedCell?.data ? `${selectedCell.data.suhu}°C` : '—'}</div>
					<div style="font-size:10px;color:rgba(232,237,248,0.55)">Avg</div>
				</div>
				<div class="detail-stat">
					<div class="detail-stat-label">Kelembapan</div>
					<div class="detail-stat-val">{selectedCell?.data ? `${selectedCell.data.hum}%` : '—'}</div>
					<div style="font-size:10px;color:rgba(232,237,248,0.55)">Avg</div>
				</div>
				<div class="detail-stat">
					<div class="detail-stat-label">CO₂</div>
					<div class="detail-stat-val">{selectedCell?.data ? `${selectedCell.data.co2} ppm` : '—'}</div>
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

	.empty-state {
		min-height: 220px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(232, 237, 248, 0.55);
		font-size: 13px;
		border: 1px dashed rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.03);
		margin-bottom: 12px;
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
		appearance: none;
		background: transparent;
		width: 100%;
		text-align: left;
		font: inherit;
		color: inherit;
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

	.cal-day:disabled {
		cursor: default;
		opacity: 1;
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

	/* Tablet: 768px and down */
	@media (max-width: 768px) {
		.history-layout {
			grid-template-columns: 1fr;
			gap: 16px;
		}

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

		.cal-day {
			min-height: 56px;
		}

		.detail-chart-wrap {
			height: 160px;
		}

		.detail-stats {
			gap: 8px;
		}

		.detail-stat {
			padding: 10px;
		}

		.detail-stat-val {
			font-size: 16px;
		}
	}

	/* Phone: 640px and down */
	@media (max-width: 640px) {
		.calendar-grid {
			gap: 2px;
		}

		.cal-day {
			min-height: 48px;
			padding: 4px 2px;
		}

		.day-num {
			font-size: 11px;
			margin-bottom: 2px;
		}

		.day-bars {
			height: 24px;
			gap: 1px;
		}

		.day-bar {
			width: 6px;
		}

		.month-btn {
			padding: 4px 10px;
			font-size: 12px;
		}

		.detail-stats {
			gap: 6px;
		}

		.detail-stat {
			padding: 8px;
		}

		.detail-stat-label {
			font-size: 10px;
		}

		.detail-stat-val {
			font-size: 14px;
		}

		.detail-chart-wrap {
			height: 140px;
		}

		.card {
			padding: 12px;
		}
	}

	/* Small phone: 480px and down */
	@media (max-width: 480px) {
		.cal-day {
			min-height: 44px;
			padding: 3px 2px;
		}

		.day-num {
			font-size: 10px;
		}

		.day-bars {
			height: 20px;
		}

		.day-bar {
			width: 5px;
		}

		.detail-stats {
			grid-template-columns: 1fr;
		}

		.detail-stat-val {
			font-size: 13px;
		}
	}
</style>
