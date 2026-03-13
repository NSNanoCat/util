import { Lodash as _ } from "./Lodash.mjs";

/* https://github.com/ljharb/qs */
/**
 * 轻量 `qs` 查询字符串工具。
 * Lightweight `qs` query-string utilities.
 *
 * 说明:
 * Notes:
 * - 参考 `qs` 的 `parse` / `stringify` 接口设计
 * - Modeled after the `qs` `parse` / `stringify` API
 * - `parse` 保持当前项目原有 `$argument` 字符串解析语义
 * - `parse` preserves the existing `$argument` string parsing semantics
 * - `stringify` 基于项目内 `Lodash` 路径能力展开对象
 * - `stringify` expands objects via the in-project `Lodash` path helpers
 *
 * 参考:
 * Reference:
 * - https://github.com/ljharb/qs
 * - https://www.npmjs.com/package/qs
 */
export class qs {
	/**
	 * 将查询字符串解析为对象。
	 * Parse a query string into an object.
	 *
	 * @param {string | Record<string, unknown> | null | undefined} [query=""] 查询字符串或对象 / Query string or object.
	 * @returns {Record<string, unknown>}
	 */
	static parse(query) {
		let result = {};
		switch (typeof query) {
			case "string": {
				const obj = Object.fromEntries(query.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
				Object.keys(obj).forEach(key => _.set(result, key, obj[key]));
				break;
			}
			case "object": {
				switch (query) {
					case null:
						break;
					default: {
						const obj = {};
						Object.keys(query).forEach(key => _.set(obj, key, query[key]));
						result = obj;
						break;
					}
				}
				break;
			}
			case "undefined":
				result = {};
				break;
		}
		return result;
	}

	/**
	 * 将对象序列化为查询字符串。
	 * Serialize an object into a query string.
	 *
	 * @param {Record<string, unknown>} [object={}] 输入对象 / Input object.
	 * @returns {string}
	 */
	static stringify(object = {}) {
		if (!object || typeof object !== "object") return "";

		const entries = [];
		Object.keys(object).forEach(key => qs.#collect(object, key, entries));

		if (entries.length === 0) return "";
		return entries
			.map(([key, value]) => `${qs.#encode(qs.#formatPath(key))}=${qs.#encode(value)}`)
			.join("&");
	}

	/**
	 * 收集待序列化的键值对。
	 * Collect key-value pairs for stringification.
	 *
	 * @param {Record<string, unknown>} object 输入对象 / Input object.
	 * @param {string} path 当前路径 / Current path.
	 * @param {[string, string][]} entries 输出数组 / Output entries.
	 * @returns {void}
	 */
	static #collect(object, path, entries) {
		const value = _.get(object, path);
		if (value === undefined) return;
		if (value === null) {
			entries.push([path, ""]);
			return;
		}
		if (Array.isArray(value)) {
			value.forEach((item, index) => {
				if (item === undefined) return;
				qs.#collect(object, `${path}[${index}]`, entries);
			});
			return;
		}
		if (qs.#isPlainObject(value)) {
			Object.keys(value).forEach(key => qs.#collect(object, `${path}.${key}`, entries));
			return;
		}
		entries.push([path, String(value)]);
	}

	/**
	 * 使用 `Lodash.toPath` 规范化输出路径。
	 * Normalize output path via `Lodash.toPath`.
	 *
	 * @param {string} path 原始路径 / Raw path.
	 * @returns {string}
	 */
	static #formatPath(path) {
		const [head, ...tail] = _.toPath(path);
		return tail.reduce((result, segment) => (/^\d+$/.test(segment) ? `${result}[${segment}]` : `${result}.${segment}`), head);
	}

	/**
	 * 判断值是否为普通对象。
	 * Check whether a value is a plain object.
	 *
	 * @param {unknown} value 输入值 / Input value.
	 * @returns {boolean}
	 */
	static #isPlainObject(value) {
		if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
		const proto = Object.getPrototypeOf(value);
		return proto === null || proto === Object.prototype;
	}

	/**
	 * 编码查询字符串片段。
	 * Encode a query-string fragment.
	 *
	 * @param {string} value 原始值 / Raw value.
	 * @returns {string}
	 */
	static #encode(value) {
		return encodeURIComponent(value);
	}
}
