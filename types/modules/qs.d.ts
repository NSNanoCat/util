import type { qs as SharedQs } from "../../polyfill/qs.d.ts";

declare module "@nsnanocat/util" {
	export interface qs extends SharedQs {}

	export const qs: typeof import("../../polyfill/qs.d.ts").qs;
}
