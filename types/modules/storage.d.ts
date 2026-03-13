declare module "@nsnanocat/util" {
	export class Storage {
		static data: Record<string, unknown> | null;
		static dataFile: string;
		static getItem<T = unknown>(keyName: string, defaultValue?: T): T;
		static setItem(keyName: string, keyValue: unknown): boolean;
		static removeItem(keyName: string): boolean;
		static clear(): boolean;
	}
}
