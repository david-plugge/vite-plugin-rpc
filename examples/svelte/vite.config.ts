import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import viteRpc from 'vite-plugin-rpc/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		viteRpc({
			baseDir: 'src',
			handlerPath: 'src/lib/rpc-client.ts'
		})
	]
});
