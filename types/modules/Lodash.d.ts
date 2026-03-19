import type { Lodash as SharedLodash } from "../../polyfill/Lodash.d.ts";

declare module "@nsnanocat/util" {
	export interface Lodash extends SharedLodash {}

	export const Lodash: typeof import("../../polyfill/Lodash.d.ts").Lodash;
}
