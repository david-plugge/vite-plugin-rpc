declare module 'vite-rpc/manifest' {
	const manifest: Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
	export default manifest;
}
