import type { Console as SharedConsole } from "../../polyfill/Console.d.ts";

type SharedStatusTexts = typeof import("../../polyfill/StatusTexts.d.ts").StatusTexts;

declare module "@nsnanocat/util" {
	export interface Console extends SharedConsole {}

	export const Console: typeof import("../../polyfill/Console.d.ts").Console;

	export const StatusTexts: SharedStatusTexts;
}
