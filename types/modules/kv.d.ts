declare module "@nsnanocat/util" {
	export interface KVNamespaceLike {
		get(key: string): Promise<string | null>;
		put(key: string, value: string): Promise<void>;
		delete(key: string): Promise<void>;
		list?(options?: KVListOptions): Promise<KVListResult>;
	}

	export interface KVListOptions {
		prefix?: string;
		limit?: number;
		cursor?: string;
	}

	export interface KVListKey {
		name: string;
		expiration?: number;
		metadata?: Record<string, unknown>;
	}

	export interface KVListResult {
		keys: KVListKey[];
		list_complete: boolean;
		cursor: string;
	}

	export class KV {
		constructor(namespace?: KVNamespaceLike | null);
		getItem<T = unknown>(keyName: string, defaultValue?: T): Promise<T>;
		setItem(keyName: string, keyValue: unknown): Promise<boolean>;
		removeItem(keyName: string): Promise<boolean>;
		clear(): Promise<boolean>;
		list(options?: KVListOptions): Promise<KVListResult>;
	}
}
