export async function handleRequest(path: string, fn: string, args: unknown[]) {
	const response = await fetch(`/rpc/${path}/${fn}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(args),
		signal: AbortSignal.timeout(5000)
	});

	if (response.headers.get('Content-Type')?.startsWith('application/json')) {
		return await response.json();
	}
	return;
}
