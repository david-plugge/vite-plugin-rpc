/* eslint-disable @typescript-eslint/no-explicit-any */

import type { GenericContext, GenericResult } from './types.js';

type MaybePromise<T> = T | Promise<T>;
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type Merge<A, B> = Omit<A, keyof B> & B;

const DECORATE = Symbol('decorate');
interface Decorate<T extends GenericContext> {
	[DECORATE]: T;
}

function decorate<T extends GenericContext>(decorators: T) {
	return {
		[DECORATE]: decorators,
	};
}

export function defineMiddleware<
	const LocalContext extends GenericContext,
	const LocalResult extends GenericResult = never,
>(
	fn: (
		context: GenericContext,
		decorate: <T extends GenericContext>(decorators: T) => Decorate<T>,
	) => MaybePromise<Decorate<LocalContext> | LocalResult>,
) {
	return fn;
}

export class RpcBuilder<Context extends GenericContext = { input: unknown }, Result extends GenericResult = never> {
	#middleware: any[] = [];

	use<const LocalContext extends GenericContext, const LocalResult extends GenericResult = never>(
		fn: (
			context: Context,
			decorate: <T extends GenericContext>(decorators: T) => Decorate<T>,
		) => MaybePromise<Decorate<LocalContext> | LocalResult>,
	): RpcBuilder<
		Prettify<Merge<Context, LocalContext>>,
		Result | (GenericResult extends LocalResult ? never : LocalResult)
	>;
	use<const LocalContext extends GenericContext, const LocalResult extends GenericResult = never>(
		other: RpcBuilder<LocalContext, LocalResult>,
	): RpcBuilder<
		Prettify<Merge<Context, LocalContext>>,
		Result | (GenericResult extends LocalResult ? never : LocalResult)
	>;
	use(mw: any): any {
		if (mw instanceof RpcBuilder) {
			const builder = new RpcBuilder();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			builder.#middleware = [...this.#middleware, ...mw.#middleware];
			return builder;
		}
		if (typeof mw === 'function') {
			const builder = new RpcBuilder();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			builder.#middleware = [...this.#middleware, mw];
			return builder;
		}

		throw new Error('invalid middleware');
	}

	create<const LocalResult extends GenericResult>(
		fn: (context: Context) => MaybePromise<LocalResult>,
	): (input: [unknown] extends [Context['input']] ? void : Context['input']) => Promise<Result | LocalResult> {
		return async (...args: unknown[]) => {
			const context: any = {
				input: args[0],
			};

			for (const mw of this.#middleware) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
				const result = await mw(context, decorate);
				if (DECORATE in result) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					Object.assign(context, result[DECORATE]);
				} else {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					return result;
				}
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			return fn(context);
		};
	}
}

export const rpc = new RpcBuilder();
