/* eslint-disable @typescript-eslint/no-explicit-any */

export type GenericContext = Record<string, any>;

export interface GenericResult {
	type: string;
	[K: string]: any;
}
