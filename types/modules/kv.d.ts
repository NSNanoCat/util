declare module "@nsnanocat/util" {
	/**
	 * 与 Cloudflare Workers `KVNamespace` 结构兼容的最小接口。
	 * Minimal interface structurally compatible with Cloudflare Workers `KVNamespace`.
	 */
	export interface KVNamespaceLike {
		get(key: string): Promise<string | null>;
		put(key: string, value: string): Promise<void>;
		delete(key: string): Promise<void>;
		list?(options?: KVListOptions): Promise<KVListResult>;
	}

	/**
	 * Node.js Cloudflare KV REST 配置。
	 * Node.js Cloudflare KV REST configuration.
	 */
	export interface KVRestConfig {
		apiEmail?: string;
		apiKey?: string;
		accountId?: string;
		namespaceId?: string;
	}

	/**
	 * KV 键列表查询参数。
	 * KV key list query options.
	 */
	export interface KVListOptions {
		prefix?: string;
		limit?: number;
		cursor?: string;
	}

	/**
	 * KV 键列表项。
	 * KV key list entry.
	 */
	export interface KVListKey {
		name: string;
		expiration?: number;
		metadata?: Record<string, unknown>;
	}

	/**
	 * KV 键列表返回结构。
	 * KV key list result shape.
	 */
	export interface KVListResult {
		keys: KVListKey[];
		list_complete: boolean;
		cursor: string;
	}

	export class KV {
		constructor(namespaceOrConfig?: KVNamespaceLike | KVRestConfig | null);
		getItem<T = unknown>(keyName: string, defaultValue?: T): Promise<T>;
		setItem(keyName: string, keyValue: unknown): Promise<boolean>;
		removeItem(keyName: string): Promise<boolean>;
		clear(): Promise<boolean>;
		list(options?: KVListOptions): Promise<KVListResult>;
	}
}
