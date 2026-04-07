"use strict";

/**
 * 统一请求参数。
 * Unified request payload.
 *
 * @typedef {object} FetchRequest
 * @property {string} url 请求地址 / Request URL.
 * @property {string} [method] 请求方法 / HTTP method.
 * @property {Record<string, any>} [headers] 请求头 / Request headers.
 * @property {string|ArrayBuffer|ArrayBufferView|object} [body] 请求体 / Request body.
 * @property {ArrayBuffer} [bodyBytes] 二进制请求体 / Binary request body.
 * @property {number|string} [timeout] 超时（秒或毫秒）/ Timeout (seconds or milliseconds).
 * @property {boolean} [redirection] 是否跟随重定向 / Whether to follow redirects.
 * @property {boolean|number|string} ["auto-cookie"] Worker / Node.js Cookie 开关 / Worker / Node.js Cookie toggle.
 */

/**
 * 统一响应结构。
 * Unified response payload.
 *
 * @typedef {object} FetchResponse
 * @property {boolean} ok 请求是否成功 / Whether request is successful.
 * @property {number} status 状态码 / HTTP status code.
 * @property {number} [statusCode] 状态码别名 / Status code alias.
 * @property {string} [statusText] 状态文本 / HTTP status text.
 * @property {Record<string, any>} [headers] 响应头 / Response headers.
 * @property {string|ArrayBuffer} [body] 响应体 / Response body.
 * @property {ArrayBuffer} [bodyBytes] 二进制响应体 / Binary response body.
 */

/**
 * 仅面向 Worker / Node.js 的 `fetch` 适配层（CJS 版本）。
 * `fetch` adapter for Worker / Node.js only (CJS version).
 *
 * @async
 * @param {FetchRequest|string} resource 请求对象或 URL / Request object or URL string.
 * @param {Partial<FetchRequest>} [options={}] 追加参数 / Extra options.
 * @returns {Promise<FetchResponse>}
 */
async function fetch(resource, options = {}) {
	switch (typeof resource) {
		case "object":
			resource = { ...options, ...resource };
			break;
		case "string":
			resource = { ...options, url: resource };
			break;
		case "undefined":
		default:
			throw new TypeError(`${Function.name}: 参数类型错误, resource 必须为对象或字符串`);
	}

	if (!resource.method) {
		resource.method = "GET";
		if (resource.body ?? resource.bodyBytes) resource.method = "POST";
	}
	delete resource.headers?.Host;
	delete resource.headers?.[":authority"];
	delete resource.headers?.["Content-Length"];
	delete resource.headers?.["content-length"];

	if (!resource.timeout) resource.timeout = 5;
	if (resource.timeout) {
		resource.timeout = Number.parseInt(resource.timeout, 10);
		if (resource.timeout > 500) resource.timeout = Math.round(resource.timeout / 1000);
		resource.timeout = resource.timeout * 1000;
	}

	if (!globalThis.fetch) {
		throw new Error(`${Function.name}: 当前 Node.js 运行时缺少全局 fetch，请升级 Node.js 版本`);
	}

	switch (resource["auto-cookie"]) {
		case undefined:
		case "true":
		case true:
		case "1":
		case 1:
		default:
			if (!globalThis.fetch?.cookieJar) globalThis.fetch = require("fetch-cookie").default(globalThis.fetch);
			break;
		case "false":
		case false:
		case "0":
		case 0:
		case "-1":
		case -1:
			break;
	}

	resource.redirect = resource.redirection ? "follow" : "manual";
	const { url, ...fetchOptions } = resource;

	return Promise.race([
		globalThis
			.fetch(url, fetchOptions)
			.then(async response => {
				const bodyBytes = await response.arrayBuffer();
				let headers;
				try {
					headers = response.headers.raw();
				} catch {
					headers = Array.from(response.headers.entries()).reduce((acc, [key, value]) => {
						acc[key] = acc[key] ? [...acc[key], value] : [value];
						return acc;
					}, {});
				}
				return {
					ok: response.ok ?? /^2\d\d$/.test(response.status),
					status: response.status,
					statusCode: response.status,
					statusText: response.statusText,
					body: new TextDecoder("utf-8").decode(bodyBytes),
					bodyBytes,
					headers: Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, key.toLowerCase() !== "set-cookie" ? value.toString() : value])),
				};
			})
			.catch(error => Promise.reject(error.message)),
		new Promise((resolve, reject) => {
			setTimeout(() => {
				reject(new Error(`${Function.name}: 请求超时, 请检查网络后重试`));
			}, resource.timeout);
		}),
	]);
}

module.exports = { fetch };
