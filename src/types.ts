/* eslint-disable @typescript-eslint/no-explicit-any */

export interface GenericContext {
	input: unknown;
	[K: string]: any;
}

export interface GenericResult {
	type: string;
	[K: string]: any;
}
