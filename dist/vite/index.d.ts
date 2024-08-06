import type { Plugin } from 'vite';
export interface ViteRpcOptions {
    handlerPath: string;
    baseDir: string;
}
export default function viteRpc(options: ViteRpcOptions): Plugin[];
