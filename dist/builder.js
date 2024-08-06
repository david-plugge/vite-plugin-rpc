/* eslint-disable @typescript-eslint/no-explicit-any */
const DECORATE = Symbol('decorate');
function decorate(decorators) {
    return {
        [DECORATE]: decorators,
    };
}
export function defineMiddleware(fn) {
    return fn;
}
export class RpcBuilder {
    #middleware = [];
    use(mw) {
        if (mw instanceof RpcBuilder) {
            const builder = new RpcBuilder();
            builder.#middleware = [...this.#middleware, ...mw.#middleware];
            return builder;
        }
        if (typeof mw === 'function') {
            const builder = new RpcBuilder();
            builder.#middleware = [...this.#middleware, mw];
            return builder;
        }
        throw new Error('invalid middleware');
    }
    create(fn) {
        return async (...args) => {
            const context = {
                input: args[0],
            };
            for (const mw of this.#middleware) {
                const result = await mw(context, decorate);
                if (DECORATE in result) {
                    Object.assign(context, result[DECORATE]);
                }
                else {
                    return result;
                }
            }
            return fn(context);
        };
    }
}
export const rpc = new RpcBuilder();
