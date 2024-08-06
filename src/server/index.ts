import manifest from 'vite-rpc/manifest';

export function matchRpcCall(path: string, method: string): ((...args: unknown[]) => Promise<unknown>) | null {
	const handler = manifest[path]?.[method];

	if (!handler) {
		return null;
	}

	return handler;
}
