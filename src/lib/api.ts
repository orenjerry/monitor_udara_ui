// Determine API base URL based on how the app is accessed
function getAPIBase(): string {
	// If explicitly set in env, use that
	// if (import.meta.env.VITE_API_URL) {
	// 	return import.meta.env.VITE_API_URL;
	// }
	
	// If running in browser, detect the host
	// if (typeof window !== 'undefined') {
	// 	const hostname = window.location.hostname;
	// 	// If accessed via localhost, use localhost. Otherwise use the same IP/host for API
	// 	if (hostname === 'localhost' || hostname === '127.0.0.1') {
	// 		return 'http://localhost:4040';
	// 	} else {
	// 		// Accessed via IP address (e.g., from phone) - use same IP for API
	// 		return `http://${hostname}:4040`;
	// 	}
	// }
	
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
