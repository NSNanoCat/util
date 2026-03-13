import { $app } from "../lib/app.mjs";
import { Lodash as _ } from "./Lodash.mjs";
import { Storage } from "./Storage.mjs";

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
 * - 在非 Worker 平台回退到 `Storage`
 * - Fall back to `Storage` on non-Worker platforms
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
	 *
	 * @type {RegExp}
	 */
	static #nameRegex = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;

	/**
	 * Cloudflare KV namespace 绑定。
	 * Cloudflare KV namespace binding.
	 *
	 * @type {{ get(key: string): Promise<string|null>; put(key: string, value: string): Promise<void>; delete(key: string): Promise<void>; list?(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: object }[]; list_complete: boolean; cursor: string }> } | undefined}
	 */
	namespace;

	/**
	 * 创建 KV 适配器实例。
	 * Create a KV adapter instance.
	 *
	 * @param {{ get(key: string): Promise<string|null>; put(key: string, value: string): Promise<void>; delete(key: string): Promise<void>; list?(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: object }[]; list_complete: boolean; cursor: string }> } | null | undefined} namespace KV namespace 绑定 / KV namespace binding.
	 */
	constructor(namespace) {
		this.namespace = namespace ?? undefined;
	}

	/**
	 * 读取存储值。
	 * Read value from persistent storage.
	 *
	 * @param {string} keyName 键名或路径键 / Key or path key.
	 * @param {*} [defaultValue=null] 默认值 / Default value when key is missing.
	 * @returns {Promise<*>}
	 */
	async getItem(keyName, defaultValue = null) {
		let keyValue = defaultValue;
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(KV.#nameRegex)?.groups ?? {};
				keyName = key;
				let value = await this.getItem(keyName, {});
				if (typeof value !== "object" || value === null) value = {};
				keyValue = _.get(value, path);
				keyValue = KV.#deserialize(keyValue);
				break;
			}
			default:
				switch ($app) {
					case "Worker":
						keyValue = await this.namespace.get(keyName);
						break;
					default:
						keyValue = Storage.getItem(keyName, defaultValue);
						break;
				}
				keyValue = KV.#deserialize(keyValue);
				break;
		}
		return keyValue ?? defaultValue;
	}

	/**
	 * 写入存储值。
	 * Write value into persistent storage.
	 *
	 * @param {string} keyName 键名或路径键 / Key or path key.
	 * @param {*} keyValue 写入值 / Value to store.
	 * @returns {Promise<boolean>}
	 */
	async setItem(keyName = new String(), keyValue = new String()) {
		let result = false;
		keyValue = KV.#serialize(keyValue);
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(KV.#nameRegex)?.groups ?? {};
				keyName = key;
				let value = await this.getItem(keyName, {});
				if (typeof value !== "object" || value === null) value = {};
				_.set(value, path, keyValue);
				result = await this.setItem(keyName, value);
				break;
			}
			default:
				switch ($app) {
					case "Worker":
						await this.namespace.put(keyName, keyValue);
						result = true;
						break;
					default:
						result = Storage.setItem(keyName, keyValue);
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
	async removeItem(keyName) {
		let result = false;
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(KV.#nameRegex)?.groups ?? {};
				keyName = key;
				let value = await this.getItem(keyName);
				if (typeof value !== "object" || value === null) value = {};
				_.unset(value, path);
				result = await this.setItem(keyName, value);
				break;
			}
			default:
				switch ($app) {
					case "Worker":
						await this.namespace.delete(keyName);
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
	async clear() {
		return false;
	}

	/**
	 * 列出命名空间中的键。
	 * List keys in the namespace.
	 *
	 * @param {{ prefix?: string; limit?: number; cursor?: string }} [options={}] 列举选项 / List options.
	 * @returns {Promise<{ keys: { name: string; expiration?: number; metadata?: object }[]; list_complete: boolean; cursor: string }>}
	 */
	async list(options = {}) {
		switch ($app) {
			case "Worker":
				return await this.namespace.list(options);
			default:
				throw new TypeError("KV.list() is only supported in Worker runtime.");
		}
	}

	/**
	 * 尝试将字符串反序列化为原始值。
	 * Try to deserialize a string into its original value.
	 *
	 * @private
	 * @param {*} value 原始值 / Raw value.
	 * @returns {*}
	 */
	static #deserialize(value) {
		try {
			return JSON.parse(value);
		} catch (e) {
			return value;
		}
	}

	/**
	 * 规范化待写入的值。
	 * Normalize a value before persisting it.
	 *
	 * @private
	 * @param {*} value 原始值 / Raw value.
	 * @returns {string}
	 */
	static #serialize(value) {
		switch (typeof value) {
			case "object":
				return JSON.stringify(value);
			default:
				return String(value);
		}
	}
}
