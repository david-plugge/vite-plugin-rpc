import type { Plugin } from 'vite';
import { getExports } from './getExportNames.js';
import { fdir } from 'fdir';
import path from 'node:path';

const PLUGIN_NAME = 'vite-plugin-rpc';
const MANIFEST_ID = 'vite-rpc/manifest';
const VIRTUAL_MANIFEST_ID = `virtual:${MANIFEST_ID}`;
const RPC_FILE_SUFFIX = '.rpc.';

const idMap: Record<string, string> = {};

export interface ViteRpcOptions {
	handlerPath: string;
	baseDir: string;
	encodePath: 'prod' | boolean;
}

export default function viteRpc(options: ViteRpcOptions): Plugin[] {
	const baseDir = path.resolve(options.baseDir);
	const handlerPath = path.resolve(options.handlerPath);

	const crawler = new fdir()
		.filter((path, isDirectory) => !isDirectory && isRpcFile(path))
		.withPathSeparator('/')
		.withFullPaths();

	let base: string;
	let encodePath: boolean;

	return [
		{
			name: `${PLUGIN_NAME}:client`,

			configResolved(config) {
				base = path.resolve(config.root, baseDir);
				encodePath = typeof options.encodePath === 'boolean' ? options.encodePath : config.command === 'build';
			},

			transform(code, id, options) {
				if (!id.startsWith(baseDir)) return;
				if (!isRpcFile(id)) return;
				if (options?.ssr) return;

				const identifier = filepathToId(base, id);

				const lines = [
					`import { handleRequest as __handleRequest__ } from '${handlerPath}'`,
					'',
					...getExports(code).map(
						(name) => `export const ${name} = (...args) => __handleRequest__('${identifier}', '${name}', args);`,
					),
				];

				return lines.join('\n');
			},
		},
		{
			name: `${PLUGIN_NAME}:server`,

			configResolved(config) {
				base = path.resolve(config.root, baseDir);
			},

			resolveId(source, _importer, options) {
				if (source !== MANIFEST_ID) return;

				if (!options.ssr) {
					throw new Error(`${MANIFEST_ID} can only be imported on the server`);
				}

				return {
					id: VIRTUAL_MANIFEST_ID,
				};
			},

			async load(id, options) {
				if (id !== VIRTUAL_MANIFEST_ID) return;

				if (!options?.ssr) {
					throw new Error(`${MANIFEST_ID} can only be imported on the server`);
				}

				const files = await crawler.crawl(base).withPromise();

				const lines = [
					...files.map((file, index) => `import * as i${index} from '${file}';`),
					'',
					'export default {',
					files.map((file, index) => `\t'${filepathToId(base, file)}': i${index}`).join(',\n'),
					'};',
				];

				return lines.join('\n');
			},
		},
	];

	function isRpcFile(filename: string) {
		return filename.includes(RPC_FILE_SUFFIX);
	}

	function filepathToId(baseDir: string, filepath: string) {
		const [idPath] = filepath.split(RPC_FILE_SUFFIX);
		const id = path.posix.relative(baseDir, idPath);

		if (encodePath) {
			return (idMap[id] ??= crypto.randomUUID());
		}

		return id;
	}
}
