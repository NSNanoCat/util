declare module "@nsnanocat/util/getStorage.mjs" {
	export interface StorageProfile {
		Settings: Record<string, unknown>;
		Configs: Record<string, unknown>;
		Caches: Record<string, unknown>;
	}

	export function traverseObject(
		o: Record<string, unknown>,
		c: (key: string, value: unknown) => unknown,
	): Record<string, unknown>;

	export function string2number(string: string): string | number;

	export function value2array(value: string | number | boolean | string[] | null | undefined): Array<string | number | boolean>;

	export default function getStorage(
		key: string,
		names: string | string[] | Array<string | string[]>,
		database: Record<string, unknown>,
	): StorageProfile;
}
