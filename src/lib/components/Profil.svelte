<script lang="ts">
	interface Member {
		name: string;
		id: string;
		role: string;
	}

	const members: Member[] = [
		{ name: 'Muhammad Allbany', id: '2504054', role: 'member' },
		{ name: 'Altiero Cahyadi', id: '2508085', role: 'member' },
		{ name: 'Febriza Melinda Tiara', id: '2507705', role: 'member' },
		{ name: 'Farris Muhammad El Hassan', id: '2511629', role: 'member' },
		{ name: 'Gielbran Akhyat Dwi Putra', id: '2500438', role: 'ketua guild' }
	];

	let syncTime = $state('');

	$effect(() => {
		const now = new Date();
		syncTime = `Last sync: ${now.toLocaleTimeString('id-ID')} — ${now.toLocaleDateString('id-ID')}`;
	});

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((w) => w[0])
			.join('')
			.slice(0, 2);
	}
</script>

<div class="page-title">Profil Anggota</div>
<div class="page-sub">Manajemen akun dan anggota tim</div>

<div class="card">
	<div class="profil-grid">
		{#each members as member}
			<div class="member-card">
				<div class="member-avatar">{getInitials(member.name)}</div>
				<div class="member-name">{member.name}</div>
				<div class="member-id">{member.id}</div>
				<div class="member-status">
					<span style="width:6px;height:6px;border-radius:50%;background:#22d6a0;display:inline-block"></span>
					{member.role}
				</div>
			</div>
		{/each}
	</div>
	<div class="sync-info">{syncTime}</div>
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

	.profil-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-bottom: 16px;
	}

	.member-card {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 24px;
		text-align: center;
		transition: all 0.3s;
		cursor: pointer;
	}

	.member-card:hover {
		background: rgba(79, 142, 247, 0.1);
		border-color: rgba(79, 142, 247, 0.4);
		transform: translateY(-3px);
	}

	.member-avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(79, 142, 247, 0.3), rgba(167, 139, 250, 0.3));
		border: 2px solid rgba(255, 255, 255, 0.12);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 12px;
		font-size: 24px;
		font-weight: 700;
		color: #e8edf8;
	}

	.member-name {
		font-size: 14px;
		font-weight: 600;
		color: #fff;
		margin-bottom: 4px;
	}

	.member-id {
		font-size: 12px;
		color: rgba(232, 237, 248, 0.55);
	}

	.member-status {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		border-radius: 20px;
		font-size: 11px;
		background: rgba(34, 214, 160, 0.15);
		color: #22d6a0;
		margin-top: 8px;
	}

	.sync-info {
		text-align: right;
		font-size: 11px;
		color: rgba(232, 237, 248, 0.55);
		margin-top: 16px;
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

		.profil-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}

		.member-card {
			padding: 18px;
		}

		.member-avatar {
			width: 56px;
			height: 56px;
			font-size: 20px;
			margin-bottom: 10px;
		}

		.member-name {
			font-size: 13px;
		}

		.member-id {
			font-size: 11px;
		}
	}

	/* Phone: 640px and down */
	@media (max-width: 640px) {
		.profil-grid {
			grid-template-columns: 1fr;
			gap: 10px;
		}

		.member-card {
			padding: 14px;
		}

		.member-avatar {
			width: 48px;
			height: 48px;
			font-size: 18px;
		}

		.member-name {
			font-size: 12px;
			margin-bottom: 2px;
		}

		.member-id {
			font-size: 10px;
		}

		.member-status {
			font-size: 10px;
			padding: 3px 8px;
		}

		.card {
			padding: 12px;
		}

		.sync-info {
			font-size: 10px;
		}
	}

	/* Small phone: 480px and down */
	@media (max-width: 480px) {
		.member-avatar {
			width: 40px;
			height: 40px;
			font-size: 16px;
		}

		.member-name {
			font-size: 11px;
		}

		.member-card {
			padding: 10px;
		}

		.member-status span {
			width: 4px;
			height: 4px;
		}
	}
</style>
