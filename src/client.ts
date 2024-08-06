export function createClient() {
	return {
		fetch(path: string, fn: string, args: unknown[]) {
			return fetch(`/rpc/${path}/${fn}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				credentials: 'same-origin',
				body: JSON.stringify(args),
			});
		},
	};
}
