import { error, json } from '@sveltejs/kit';
import { matchRpcCall } from 'vite-plugin-rpc/server';

export const POST = async ({ params: { path, method }, request }) => {
	const fn = matchRpcCall(path, method);

	if (!fn) {
		error(404);
	}

	const args = await request.json();

	const result = await fn(...args);

	return result ? json(result) : new Response();
};
