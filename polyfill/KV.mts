import { $app } from "../lib/app.mjs";
import { Lodash as _ } from "./Lodash.mjs";
import { Storage } from "./Storage.mjs";

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

/**
 * 与 Cloudflare Workers `KVNamespace` 结构兼容的最小接口。
 * Minimal interface structurally compatible with Cloudflare Workers `KVNamespace`.
 *
 * 说明:
 * Notes:
 * - 可直接接收官方 `Env` 中声明为 `KVNamespace` 的 binding。
 * - Can directly accept bindings declared as `KVNamespace` in the official `Env`.
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

interface KVResolvedRestConfig {
	apiEmail?: string;
	apiKey?: string;
	accountId?: string;
	namespaceId?: string;
}

interface CloudflareAPIError {
	code?: number;
	message?: string;
}

interface CloudflareResultInfo {
	cursor?: string;
	cursors?: {
		after?: string;
	};
}

interface CloudflareAPIEnvelope<Result = unknown> {
	success?: boolean;
	errors?: CloudflareAPIError[];
	messages?: unknown[];
	result?: Result;
	result_info?: CloudflareResultInfo;
}

interface KVRequestOptions {
	body?: string;
	headers?: Record<string, string>;
	query?: Record<string, string | number | undefined>;
	responseType?: "json" | "text";
	allowedStatusCodes?: number[];
}

interface KVRequestResult<T> {
	response: Response;
	body: T;
}

type KVConstructorInput = KVNamespaceLike | KVRestConfig | null | undefined;

/**
 * Cloudflare Workers KV 异步适配器。
 * Async adapter for Cloudflare Workers KV.
 *
 * 设计目标:
 * Design goal:
 * - 提供与 `Storage` 接近的异步接口
 * - Provide an async API close to `Storage`
 * - 在 Worker 中使用显式传入的 KV namespace binding
 * - Use an explicitly passed KV namespace binding in Workers
 * - 在 Node.js 中可选走 Cloudflare KV REST API
 * - Optionally use Cloudflare KV REST API in Node.js
 * - 其他平台回退到 `Storage`
 * - Fall back to `Storage` on other platforms
 *
 * 支持路径键:
 * Supports path key:
 * - `@root.path.to.value`
 *
 * @link https://developers.cloudflare.com/kv/get-started/#5-access-your-kv-namespace-from-your-worker
 * @link https://developers.cloudflare.com/kv/api/read-key-value-pairs/
 * @link https://developers.cloudflare.com/kv/api/write-key-value-pairs/
 * @link https://developers.cloudflare.com/kv/api/delete-key-value-pairs/
 * @link https://developers.cloudflare.com/kv/api/list-keys/
 */
export class KV {
	/**
	 * `@key.path` 解析正则。
	 * Regex for `@key.path` parsing.
	 */
	static readonly #nameRegex = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;

	/**
	 * Cloudflare API 根地址。
	 * Cloudflare API root URL.
	 */
	static readonly #restAPIBaseURL = "https://api.cloudflare.com/client/v4";

	/**
	 * Cloudflare KV namespace 绑定。
	 * Cloudflare KV namespace binding.
	 */
	namespace: KVNamespaceLike | undefined;

	/**
	 * Cloudflare KV REST 配置。
	 * Cloudflare KV REST configuration.
	 */
	#restConfig: KVResolvedRestConfig;

	/**
	 * 创建 KV 适配器实例。
	 * Create a KV adapter instance.
	 *
	 * @param {KVConstructorInput} namespaceOrConfig KV namespace 绑定或 REST 配置 / KV namespace binding or REST configuration.
	 */
	constructor(namespaceOrConfig?: KVConstructorInput) {
		this.namespace = undefined;
		this.#restConfig = KV.#normalizeRestConfig(namespaceOrConfig);
		switch (true) {
			case Boolean(namespaceOrConfig) && !KV.#hasRESTConfigKeys(namespaceOrConfig):
				this.namespace = namespaceOrConfig as KVNamespaceLike;
				break;
			default:
				break;
		}
	}

	/**
	 * 读取存储值。
	 * Read value from persistent storage.
	 *
	 * @param {string} keyName 键名或路径键 / Key or path key.
	 * @param {T} [defaultValue=null as T] 默认值 / Default value when key is missing.
	 * @returns {Promise<T>}
	 */
	async getItem<T = unknown>(keyName: string, defaultValue = null as T): Promise<T> {
		let keyValue: unknown = defaultValue;
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(KV.#nameRegex)?.groups ?? {};
				keyName = key ?? keyName;
				let value = await this.getItem<Record<string, unknown>>(keyName, {});
				if (typeof value !== "object" || value === null) value = {};
				keyValue = _.get(value, path);
				keyValue = KV.#deserialize(keyValue);
				break;
			}
			default:
				switch (true) {
					case Boolean(this.namespace):
						keyValue = await this.namespace!.get(keyName);
						break;
					case $app === "Node.js" && this.#hasRestConfig():
						keyValue = await this.#getRESTValue(keyName);
						break;
					default:
						keyValue = Storage.getItem(keyName, defaultValue);
						break;
				}
				keyValue = KV.#deserialize(keyValue);
				break;
		}
		return (keyValue ?? defaultValue) as T;
	}

	/**
	 * 写入存储值。
	 * Write value into persistent storage.
	 *
	 * @param {string} keyName 键名或路径键 / Key or path key.
	 * @param {unknown} keyValue 写入值 / Value to store.
	 * @returns {Promise<boolean>}
	 */
	async setItem(keyName: string = String(), keyValue: unknown = String()): Promise<boolean> {
		let result = false;
		const serializedValue = KV.#serialize(keyValue);
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(KV.#nameRegex)?.groups ?? {};
				keyName = key ?? keyName;
				let value = await this.getItem<Record<string, unknown>>(keyName, {});
				if (typeof value !== "object" || value === null) value = {};
				_.set(value, path, serializedValue);
				result = await this.setItem(keyName, value);
				break;
			}
			default:
				switch (true) {
					case Boolean(this.namespace):
						await this.namespace!.put(keyName, serializedValue);
						result = true;
						break;
					case $app === "Node.js" && this.#hasRestConfig():
						await this.#setRESTValue(keyName, serializedValue);
						result = true;
						break;
					default:
						result = Storage.setItem(keyName, serializedValue);
						break;
				}
				break;
		}
		return result;
	}

	/**
	 * 删除存储值。
	 * Remove value from persistent storage.
	 *
	 * @param {string} keyName 键名或路径键 / Key or path key.
	 * @returns {Promise<boolean>}
	 */
	async removeItem(keyName: string): Promise<boolean> {
		let result = false;
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(KV.#nameRegex)?.groups ?? {};
				keyName = key ?? keyName;
				let value = await this.getItem<Record<string, unknown>>(keyName, {});
				if (typeof value !== "object" || value === null) value = {};
				_.unset(value, path);
				result = await this.setItem(keyName, value);
				break;
			}
			default:
				switch (true) {
					case Boolean(this.namespace):
						await this.namespace!.delete(keyName);
						result = true;
						break;
					case $app === "Node.js" && this.#hasRestConfig():
						await this.#deleteRESTValue(keyName);
						result = true;
						break;
					default:
						result = Storage.removeItem(keyName);
						break;
				}
				break;
		}
		return result;
	}

	/**
	 * 清空存储。
	 * Clear storage.
	 *
	 * @returns {Promise<boolean>}
	 */
	async clear(): Promise<boolean> {
		return false;
	}

	/**
	 * 列出命名空间中的键。
	 * List keys in the namespace.
	 *
	 * @param {KVListOptions} [options={}] 列举选项 / List options.
	 * @returns {Promise<KVListResult>}
	 */
	async list(options: KVListOptions = {}): Promise<KVListResult> {
		switch (true) {
			case Boolean(this.namespace):
				return await this.namespace!.list!(options);
			case $app === "Node.js" && this.#hasRestConfig():
				return await this.#listRESTKeys(options);
			default:
				throw new TypeError("KV.list() is only supported with a namespace binding or Node.js REST config.");
		}
	}

	/**
	 * 判断对象是否包含 REST 配置字段。
	 * Check whether an object contains REST config keys.
	 *
	 * @private
	 * @param {unknown} value 待检测值 / Value to inspect.
	 * @returns {value is KVRestConfig}
	 */
	static #hasRESTConfigKeys(value: unknown): value is KVRestConfig {
		return ["apiEmail", "apiKey", "accountId", "namespaceId"].some(keyName => keyName in Object(value));
	}

	/**
	 * 读取 Node.js 环境变量。
	 * Read Node.js environment variables.
	 *
	 * @private
	 * @returns {Record<string, string | undefined>}
	 */
	static #processEnv(): Record<string, string | undefined> {
		const runtime = globalThis as typeof globalThis & {
			process?: {
				env?: Record<string, string | undefined>;
			};
		};
		return runtime.process?.env ?? {};
	}

	/**
	 * 归一化 Cloudflare KV REST 配置。
	 * Normalize Cloudflare KV REST configuration.
	 *
	 * @private
	 * @param {KVConstructorInput} [config] 原始配置 / Raw configuration.
	 * @returns {KVResolvedRestConfig}
	 */
	static #normalizeRestConfig(config?: KVConstructorInput): KVResolvedRestConfig {
		const env = KV.#processEnv();
		const restConfig = (config ?? {}) as KVRestConfig;
		return {
			apiEmail: restConfig.apiEmail ?? env.CLOUDFLARE_EMAIL,
			apiKey: restConfig.apiKey ?? env.CLOUDFLARE_API_KEY,
			accountId: restConfig.accountId ?? env.ACCOUNT_ID,
			namespaceId: restConfig.namespaceId ?? env.NAMESPACE_ID,
		};
	}

	/**
	 * 判断 REST 配置是否完整。
	 * Check whether the REST configuration is complete.
	 *
	 * @private
	 * @returns {boolean}
	 */
	#hasRestConfig(): boolean {
		return Boolean(this.#restConfig.apiEmail && this.#restConfig.apiKey && this.#restConfig.accountId && this.#restConfig.namespaceId);
	}

	/**
	 * 读取 REST 后端中的键值。
	 * Read a key from the REST backend.
	 *
	 * @private
	 * @param {string} keyName 键名 / Key name.
	 * @returns {Promise<string | null>}
	 */
	async #getRESTValue(keyName: string): Promise<string | null> {
		const { response, body } = await this.#request<string>("GET", `/values/${encodeURIComponent(keyName)}`, {
			responseType: "text",
			allowedStatusCodes: [404],
		});
		switch (response.status) {
			case 404:
				return null;
			default:
				return body;
		}
	}

	/**
	 * 写入 REST 后端中的键值。
	 * Write a key to the REST backend.
	 *
	 * @private
	 * @param {string} keyName 键名 / Key name.
	 * @param {string} value 序列化后的值 / Serialized value.
	 * @returns {Promise<void>}
	 */
	async #setRESTValue(keyName: string, value: string): Promise<void> {
		await this.#request<CloudflareAPIEnvelope>("PUT", `/values/${encodeURIComponent(keyName)}`, {
			body: value,
			headers: {
				"Content-Type": "text/plain;charset=UTF-8",
			},
		});
	}

	/**
	 * 删除 REST 后端中的键值。
	 * Delete a key from the REST backend.
	 *
	 * @private
	 * @param {string} keyName 键名 / Key name.
	 * @returns {Promise<void>}
	 */
	async #deleteRESTValue(keyName: string): Promise<void> {
		await this.#request<CloudflareAPIEnvelope>("DELETE", `/values/${encodeURIComponent(keyName)}`);
	}

	/**
	 * 列出 REST 后端中的键。
	 * List keys from the REST backend.
	 *
	 * @private
	 * @param {KVListOptions} [options={}] 列举选项 / List options.
	 * @returns {Promise<KVListResult>}
	 */
	async #listRESTKeys(options: KVListOptions = {}): Promise<KVListResult> {
		const { body } = await this.#request<CloudflareAPIEnvelope<KVListKey[]>>("GET", "/keys", {
			query: {
				prefix: options.prefix,
				limit: options.limit,
				cursor: options.cursor,
			},
		});
		const cursor = body?.result_info?.cursor ?? body?.result_info?.cursors?.after ?? "";
		return {
			keys: Array.isArray(body?.result) ? body.result : [],
			list_complete: !cursor,
			cursor,
		};
	}

	/**
	 * 发起 Cloudflare KV REST 请求。
	 * Send a Cloudflare KV REST request.
	 *
	 * @private
	 * @param {string} method 请求方法 / HTTP method.
	 * @param {string} pathname 相对路径 / Relative path.
	 * @param {KVRequestOptions} [options={}] 请求选项 / Request options.
	 * @returns {Promise<KVRequestResult<T>>}
	 */
	async #request<T>(method: string, pathname: string, options: KVRequestOptions = {}): Promise<KVRequestResult<T>> {
		if (typeof globalThis.fetch !== "function") throw new TypeError("KV REST API requires global fetch in Node.js.");
		const url = this.#createRESTURL(pathname, options.query);
		const headers = {
			"X-Auth-Email": this.#restConfig.apiEmail ?? "",
			"X-Auth-Key": this.#restConfig.apiKey ?? "",
			...options.headers,
		};
		const response = await globalThis.fetch(url, {
			method,
			headers,
			body: options.body,
		});
		const bodyText = await response.text();
		switch (options.responseType) {
			case "text":
				if (response.ok || options.allowedStatusCodes?.includes(response.status)) return { response, body: bodyText as T };
				throw KV.#createRESTError(response, KV.#parseJSON<CloudflareAPIEnvelope>(bodyText));
			default: {
				const body = bodyText ? KV.#parseJSON<T>(bodyText) : (null as T);
				const isAllowedStatus = options.allowedStatusCodes?.includes(response.status) ?? false;
				if ((response.ok || isAllowedStatus) && (body as CloudflareAPIEnvelope | null)?.success !== false) return { response, body };
				throw KV.#createRESTError(response, body as CloudflareAPIEnvelope | string | null);
			}
		}
	}

	/**
	 * 构造 Cloudflare KV REST URL。
	 * Build a Cloudflare KV REST URL.
	 *
	 * @private
	 * @param {string} pathname 相对路径 / Relative path.
	 * @param {Record<string, string | number | undefined>} [query={}] 查询参数 / Query parameters.
	 * @returns {URL}
	 */
	#createRESTURL(pathname: string, query: Record<string, string | number | undefined> = {}): URL {
		const url = new URL(
			`${KV.#restAPIBaseURL}/accounts/${encodeURIComponent(this.#restConfig.accountId ?? "")}/storage/kv/namespaces/${encodeURIComponent(this.#restConfig.namespaceId ?? "")}${pathname}`,
		);
		for (const [keyName, keyValue] of Object.entries(query)) {
			if (keyValue !== undefined) url.searchParams.set(keyName, String(keyValue));
		}
		return url;
	}

	/**
	 * 解析 JSON 字符串。
	 * Parse a JSON string.
	 *
	 * @private
	 * @param {string} value 原始字符串 / Raw string.
	 * @returns {T}
	 */
	static #parseJSON<T>(value: string): T {
		try {
			return JSON.parse(value) as T;
		} catch (e) {
			return value as T;
		}
	}

	/**
	 * 构造 REST 请求错误。
	 * Build a REST request error.
	 *
	 * @private
	 * @param {Response} response 原始响应 / Raw response.
	 * @param {CloudflareAPIEnvelope | string | null} body 响应体 / Response body.
	 * @returns {Error}
	 */
	static #createRESTError(response: Response, body: CloudflareAPIEnvelope | string | null): Error {
		const errors = Array.isArray((body as CloudflareAPIEnvelope | null)?.errors) ? (body as CloudflareAPIEnvelope).errors ?? [] : [];
		const messages = errors
			.map(error => [error?.code, error?.message].filter(Boolean).join(": "))
			.filter(Boolean)
			.join("; ");
		const message = messages || `${response.status} ${response.statusText}`;
		return new Error(`KV REST request failed: ${message}`);
	}

	/**
	 * 尝试将字符串反序列化为原始值。
	 * Try to deserialize a string into its original value.
	 *
	 * @private
	 * @param {unknown} value 原始值 / Raw value.
	 * @returns {unknown}
	 */
	static #deserialize(value: unknown): unknown {
		try {
			return JSON.parse(value as string);
		} catch (e) {
			return value;
		}
	}

	/**
	 * 规范化待写入的值。
	 * Normalize a value before persisting it.
	 *
	 * @private
	 * @param {unknown} value 原始值 / Raw value.
	 * @returns {string}
	 */
	static #serialize(value: unknown): string {
		switch (typeof value) {
			case "object":
				return JSON.stringify(value);
			default:
				return String(value);
		}
	}
}
