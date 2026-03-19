import type { Storage as SharedStorage } from "../../polyfill/Storage.d.ts";

declare module "@nsnanocat/util" {
	export interface Storage extends SharedStorage {}

	export const Storage: typeof import("../../polyfill/Storage.d.ts").Storage;
}
