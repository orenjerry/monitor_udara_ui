// Determine API base URL based on how the app is accessed
function getAPIBase(): string {
  return 'http://alpha.prowcloud.my.id:26001';
}

export const API_BASE = getAPIBase();

async function request(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getRealtime(mac?: string) {
  const q = mac ? `?mac_address=${encodeURIComponent(mac)}` : '';
  const data = await request(`/api/v1/realtime${q}`);
  return data.data ?? data;
}

export async function getHistory(mac?: string) {
  const q = mac ? `?mac_address=${encodeURIComponent(mac)}` : '';
  const data = await request(`/api/v1/history${q}`);
  return data.data ?? data;
}

export async function getWarnings(mac?: string) {
  const q = mac ? `?mac_address=${encodeURIComponent(mac)}` : '';
  const data = await request(`/api/v1/warnings${q}`);
  return data.data ?? data;
}

export async function getWarningsCount(mac?: string) {
  const q = mac ? `?mac_address=${encodeURIComponent(mac)}` : '';
  const data = await request(`/api/v1/warnings/count${q}`);
  return data.count ?? 0;
}

export async function dismissWarning(id: number) {
  const res = await fetch(`${API_BASE}/api/v1/warnings/dismiss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDashboard(mac?: string) {
  const q = mac ? `?mac_address=${encodeURIComponent(mac)}` : '';
  const data = await request(`/api/v1/dashboard${q}`);
  return data.data ?? data;
}
