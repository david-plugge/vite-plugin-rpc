import { getExports } from './getExportNames.js';
import { fdir } from 'fdir';
import path from 'node:path';
const PLUGIN_NAME = 'vite-plugin-rpc';
export default function viteRpc(options) {
    const baseDir = path.resolve(options.baseDir);
    const handlerPath = path.resolve(options.handlerPath);
    return [
        client({
            handlerPath,
            baseDir,
        }),
        server({
            baseDir,
        }),
    ];
}
function client({ handlerPath, baseDir }) {
    let base;
    return {
        name: `${PLUGIN_NAME}:client`,
        configResolved(config) {
            base = path.resolve(config.root, baseDir);
        },
        transform(code, id) {
            if (!id.startsWith(baseDir))
                return;
            if (!isRpcFile(id))
                return;
            const identifier = filepathToId(base, id);
            const lines = [
                `import { handleRequest as __handleRequest__ } from '${handlerPath}'`,
                '',
                ...getExports(code).map((name) => `export const ${name} = (...args) => __handleRequest__('${identifier}', '${name}', args);`),
            ];
            return lines.join('\n');
        },
    };
}
function server({ baseDir }) {
    const MANIFEST_ID = 'vite-rpc/manifest';
    const VIRTUAL_MANIFEST_ID = `virtual:${MANIFEST_ID}`;
    const crawler = new fdir()
        .filter((path, isDirectory) => !isDirectory && isRpcFile(path))
        .withPathSeparator('/')
        .withFullPaths();
    let base;
    return {
        name: `${PLUGIN_NAME}:server`,
        configResolved(config) {
            base = path.resolve(config.root, baseDir);
        },
        resolveId(source, _importer, options) {
            if (source !== MANIFEST_ID)
                return;
            if (!options.ssr) {
                throw new Error(`${MANIFEST_ID} can only be imported on the server`);
            }
            return {
                id: VIRTUAL_MANIFEST_ID,
            };
        },
        async load(id, options) {
            if (id !== VIRTUAL_MANIFEST_ID)
                return;
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
    };
}
function isRpcFile(filename) {
    return filename.includes('.rpc.');
}
function filepathToId(baseDir, filepath) {
    return path.relative(filepath, baseDir);
}
