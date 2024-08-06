declare module 'vite-rpc/manifest' {
	const manifest: Record<string, Record<string, (...args: unknown[]) => unknown>>;
	export default manifest;
}
