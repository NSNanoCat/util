import fetchCookie from "fetch-cookie";
import nodeFetch from "node-fetch";
import { fetch as fetchBase } from "./fetch.mjs";

/**
 * Node.js ESM 请求入口。
 * Node.js ESM fetch entry.
 *
 * @param {object|string} resource 请求对象或 URL / Request object or URL string.
 * @param {object} [options={}] 追加参数 / Extra options.
 * @returns {Promise<object>}
 */
export async function fetch(resource, options = {}) {
	let request;
	switch (typeof resource) {
		case "object":
			request = { ...options, ...resource };
			break;
		case "string":
			request = { ...options, url: resource };
			break;
		case "undefined":
		default:
			throw new TypeError(`${Function.name}: 参数类型错误, resource 必须为对象或字符串`);
	}

	switch (typeof globalThis.fetch) {
		case "undefined":
			globalThis.fetch = nodeFetch;
			break;
		case "function":
			break;
		default:
			throw new Error(`${Function.name}: 当前 Node.js 运行时不支持 Fetch API`);
	}

	switch (request["auto-cookie"]) {
		case "false":
		case false:
		case "0":
		case 0:
		case "-1":
		case -1:
			break;
		case undefined:
		case "true":
		case true:
		case "1":
		case 1:
		default:
			switch (Boolean(globalThis.fetch?.cookieJar)) {
				case false:
					globalThis.fetch = fetchCookie(globalThis.fetch);
					break;
			}
			break;
	}

	return fetchBase(resource, options);
}
