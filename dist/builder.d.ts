import type { GenericContext, GenericResult } from './types.js';
type MaybePromise<T> = T | Promise<T>;
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type Merge<A, B> = Omit<A, keyof B> & B;
declare const DECORATE: unique symbol;
type Decorate<T extends GenericContext> = {
    [DECORATE]: T;
};
export declare function defineMiddleware<const LocalContext extends GenericContext, const LocalResult extends GenericResult = never>(fn: (context: GenericContext, decorate: <T extends GenericContext>(decorators: T) => Decorate<T>) => MaybePromise<Decorate<LocalContext> | LocalResult>): (context: GenericContext, decorate: <T extends GenericContext>(decorators: T) => Decorate<T>) => MaybePromise<Decorate<LocalContext> | LocalResult>;
export declare class RpcBuilder<Context extends GenericContext = {
    input: unknown;
}, Result extends GenericResult = never> {
    #private;
    use<const LocalContext extends GenericContext, const LocalResult extends GenericResult = never>(fn: (context: Context, decorate: <T extends GenericContext>(decorators: T) => Decorate<T>) => MaybePromise<Decorate<LocalContext> | LocalResult>): RpcBuilder<Prettify<Merge<Context, LocalContext>>, Result | (GenericResult extends LocalResult ? never : LocalResult)>;
    use<const LocalContext extends GenericContext, const LocalResult extends GenericResult = never>(other: RpcBuilder<LocalContext, LocalResult>): RpcBuilder<Prettify<Merge<Context, LocalContext>>, Result | (GenericResult extends LocalResult ? never : LocalResult)>;
    create<const LocalResult extends GenericResult>(fn: (context: Context) => MaybePromise<LocalResult>): (input: [unknown] extends [Context['input']] ? void : Context['input']) => Promise<Result | LocalResult>;
}
export declare const rpc: RpcBuilder<{
    input: unknown;
}, never>;
export {};
