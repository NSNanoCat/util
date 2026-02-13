import { $app } from "../lib/app.mjs";
import { Console } from "./Console.mjs";
import { Lodash as _ } from "./Lodash.mjs";
import { StatusTexts } from "./StatusTexts.mjs";

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
 * @property {string} [policy] 指定策略 / Preferred policy.
 * @property {boolean} [redirection] 是否跟随重定向 / Whether to follow redirects.
 * @property {boolean} ["auto-redirect"] 平台重定向字段 / Platform redirect flag.
 * @property {Record<string, any>} [opts] 平台扩展字段 / Platform extension fields.
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
 * 跨平台 `fetch` 适配层。
 * Cross-platform `fetch` adapter.
 *
 * 功能:
 * Features:
 * - 统一 Quantumult X / Loon / Surge / Stash / Egern / Shadowrocket / Node.js 请求接口
 * - Normalize request APIs across Quantumult X / Loon / Surge / Stash / Egern / Shadowrocket / Node.js
 * - 统一返回体字段（`ok/status/statusText/body/bodyBytes`）
 * - Normalize response fields (`ok/status/statusText/body/bodyBytes`)
 *
 * @link https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API
 * @async
 * @param {FetchRequest|string} resource 请求对象或 URL / Request object or URL string.
 * @param {Partial<FetchRequest>} [options={}] 追加参数 / Extra options.
 * @returns {Promise<FetchResponse>}
 */
export async function fetch(resource, options = {}) {
	// 初始化参数
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
	// 自动判断请求方法
	if (!resource.method) {
		resource.method = "GET";
		if (resource.body ?? resource.bodyBytes) resource.method = "POST";
	}
	// 移除请求头中的部分参数, 让其自动生成
	delete resource.headers?.Host;
	delete resource.headers?.[":authority"];
	delete resource.headers?.["Content-Length"];
	delete resource.headers?.["content-length"];
	// 定义请求方法（小写）
	const method = resource.method.toLocaleLowerCase();
	// 转换请求超时时间参数
	if (!resource.timeout) resource.timeout = 5;
	if (resource.timeout) {
		resource.timeout = Number.parseInt(resource.timeout, 10);
		// 转换为秒，大于500视为毫秒，小于等于500视为秒
		if (resource.timeout > 500) resource.timeout = Math.round(resource.timeout / 1000);
	}
	// 判断平台
	switch ($app) {
		case "Loon":
		case "Surge":
		case "Stash":
		case "Egern":
		case "Shadowrocket":
		default:
			// 转换请求参数
			if (resource.timeout) {
				switch ($app) {
					case "Loon":
						resource.timeout = resource.timeout * 1000;
						break;
					case "Shadowrocket":
					case "Stash":
					case "Egern":
					case "Surge":
					default:
						break;
				}
			}
			if (resource.policy) {
				switch ($app) {
					case "Loon":
						resource.node = resource.policy;
						break;
					case "Stash":
						_.set(resource, "headers.X-Stash-Selected-Proxy", encodeURI(resource.policy));
						break;
					case "Shadowrocket":
						_.set(resource, "headers.X-Surge-Proxy", resource.policy);
						break;
				}
			}
			if (typeof resource.redirection === "boolean") resource["auto-redirect"] = resource.redirection;
			// 转换请求体
			if (resource.bodyBytes && !resource.body) {
				resource.body = resource.bodyBytes;
				resource.bodyBytes = undefined;
			}
			// 判断是否请求二进制响应体
			switch ((resource.headers?.Accept || resource.headers?.accept)?.split(";")?.[0]) {
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/vnd.apple.flatbuffer":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					resource["binary-mode"] = true;
					break;
			}
			// 发送请求
			return await new Promise((resolve, reject) => {
				$httpClient[method](resource, (error, response, body) => {
					if (error) reject(error);
					else {
						response.ok = /^2\d\d$/.test(response.status);
						response.statusCode = response.status;
						response.statusText = StatusTexts[response.status];
						if (body) {
							response.body = body;
							if (resource["binary-mode"] == true) response.bodyBytes = body;
						}
						resolve(response);
					}
				});
			});
		case "Quantumult X":
			// 转换请求参数
			resource.timeout = resource.timeout * 1000;
			if (resource.policy) _.set(resource, "opts.policy", resource.policy);
			if (typeof resource["auto-redirect"] === "boolean") _.set(resource, "opts.redirection", resource["auto-redirect"]);
			// 转换请求体
			if (resource.body instanceof ArrayBuffer) {
				resource.bodyBytes = resource.body;
				resource.body = undefined;
			} else if (ArrayBuffer.isView(resource.body)) {
				resource.bodyBytes = resource.body.buffer.slice(resource.body.byteOffset, resource.body.byteLength + resource.body.byteOffset);
				resource.body = undefined;
			} else if (resource.body) resource.bodyBytes = undefined;
			// 发送请求
			return Promise.race([
				await $task.fetch(resource).then(
					response => {
						response.ok = /^2\d\d$/.test(response.statusCode);
						response.status = response.statusCode;
						response.statusText = StatusTexts[response.status];
						switch ((response.headers?.["Content-Type"] ?? response.headers?.["content-type"])?.split(";")?.[0]) {
							case "application/protobuf":
							case "application/x-protobuf":
							case "application/vnd.google.protobuf":
							case "application/vnd.apple.flatbuffer":
							case "application/grpc":
							case "application/grpc+proto":
							case "application/octet-stream":
								response.body = response.bodyBytes;
								break;
							case undefined:
							default:
								break;
						}
						response.bodyBytes = undefined;
						return response;
					},
					reason => Promise.reject(reason.error),
				),
				new Promise((resolve, reject) => {
					setTimeout(() => {
						reject(new Error(`${Function.name}: 请求超时, 请检查网络后重试`));
					}, resource.timeout);
				}),
			]);
		case "Node.js": {
			const nodeFetch = globalThis.fetch ? globalThis.fetch : require("node-fetch");
			const fetchCookie = globalThis.fetchCookie ? globalThis.fetchCookie : require("fetch-cookie").default;
			const fetch = fetchCookie(nodeFetch);
			// 转换请求参数
			resource.timeout = resource.timeout * 1000;
			resource.redirect = resource.redirection ? "follow" : "manual";
			const { url, ...options } = resource;
			// 发送请求
			return Promise.race([
				await fetch(url, options)
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
							bodyBytes: bodyBytes,
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
	}
}
