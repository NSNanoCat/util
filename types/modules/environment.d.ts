declare module "@nsnanocat/util/lib/environment.mjs" {
	export const $environment: Record<string, unknown>;
	export function environment(): Record<string, unknown>;
}
