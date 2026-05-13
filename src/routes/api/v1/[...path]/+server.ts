import type { RequestHandler } from './$types';

const UPSTREAM_API_BASE = 'http://monitor-udara-api.kinnaa.site:26001';

async function proxyRequest({ request, params, url }: Parameters<RequestHandler>[0]) {
	const upstreamUrl = new URL(`/api/v1/${params.path}`, UPSTREAM_API_BASE);
	upstreamUrl.search = url.search;

	return fetch(new Request(upstreamUrl, request));
}

export const GET: RequestHandler = proxyRequest;
export const POST: RequestHandler = proxyRequest;
export const PUT: RequestHandler = proxyRequest;
export const PATCH: RequestHandler = proxyRequest;
export const DELETE: RequestHandler = proxyRequest;
export const OPTIONS: RequestHandler = proxyRequest;
export const HEAD: RequestHandler = proxyRequest;