import type { Fetch as SharedFetch, FetchRequest as SharedFetchRequest, FetchResponse as SharedFetchResponse } from "../../polyfill/fetch.d.ts";

declare module "@nsnanocat/util" {
	export interface FetchRequest extends SharedFetchRequest {}

	export interface FetchResponse extends SharedFetchResponse {}

	export const fetch: SharedFetch;
}
