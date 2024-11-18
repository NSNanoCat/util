import { Lodash as _ } from "./Lodash.mjs";
import { $app } from "../lib/app.mjs";
import { logError } from "../lib/logError.mjs";

/**
 * fetch
 *
 * @link https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API
 * @export
 * @async
 * @param {object|string} request
 * @param {object} [option]
 * @returns {Promise<object>}
 */
export async function fetch(request, option) {
	// 初始化参数
	switch (request.constructor) {
		case Object:
			request = { ...option, ...request };
			break;
		case String:
			request = { ...option, url: request };
			break;
	}
	// 自动判断请求方法
	if (!request.method) {
		request.method = "GET";
		if (request.body ?? request.bodyBytes) request.method = "POST";
	}
	// 移除请求头中的部分参数, 让其自动生成
	delete request.headers?.Host;
	delete request.headers?.[":authority"];
	delete request.headers?.["Content-Length"];
	delete request.headers?.["content-length"];
	// 定义请求方法（小写）
	const method = request.method.toLocaleLowerCase();
	// 判断平台
	switch ($app) {
		case "Loon":
		case "Surge":
		case "Stash":
		case "Egern":
		case "Shadowrocket":
		default:
			// 转换请求参数
			if (request.timeout) {
				request.timeout = Number.parseInt(request.timeout, 10);
				switch ($app) {
					case "Loon":
					case "Shadowrocket":
					case "Stash":
					case "Egern":
					default:
						request.timeout = request.timeout / 1000;
						break;
					case "Surge":
						break;
				}
			}
			if (request.policy) {
				switch ($app) {
					case "Loon":
						request.node = request.policy;
						break;
					case "Stash":
						_.set(request, "headers.X-Stash-Selected-Proxy", encodeURI(request.policy));
						break;
					case "Shadowrocket":
						_.set(request, "headers.X-Surge-Proxy", request.policy);
						break;
				}
			}
			if (typeof request.redirection === "boolean") request["auto-redirect"] = request.redirection;
			// 转换请求体
			if (request.bodyBytes && !request.body) {
				request.body = request.bodyBytes;
				request.bodyBytes = undefined;
			}
			// 判断是否请求二进制响应体
			switch ((request.headers?.Accept || request.headers?.accept)?.split(";")?.[0]) {
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/vnd.apple.flatbuffer":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					request["binary-mode"] = true;
					break;
			}
			// 发送请求
			return await new Promise((resolve, reject) => {
				$httpClient[method](request, (error, response, body) => {
					if (error) reject(error);
					else {
						response.ok = /^2\d\d$/.test(response.status);
						response.statusCode = response.status;
						if (body) {
							response.body = body;
							if (request["binary-mode"] == true) response.bodyBytes = body;
						}
						resolve(response);
					}
				});
			});
		case "Quantumult X":
			// 转换请求参数
			if (request.policy) _.set(request, "opts.policy", request.policy);
			if (typeof request["auto-redirect"] === "boolean") _.set(request, "opts.redirection", request["auto-redirect"]);
			// 转换请求体
			if (request.body instanceof ArrayBuffer) {
				request.bodyBytes = request.body;
				request.body = undefined;
			} else if (ArrayBuffer.isView(request.body)) {
				request.bodyBytes = request.body.buffer.slice(request.body.byteOffset, request.body.byteLength + request.body.byteOffset);
				request.body = undefined;
			} else if (request.body) request.bodyBytes = undefined;
			// 发送请求
			return await $task.fetch(request).then(
				response => {
					response.ok = /^2\d\d$/.test(response.statusCode);
					response.status = response.statusCode;
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
			);
		case "Node.js": {
			const iconv = require("iconv-lite");
			const got = globalThis.got ? globalThis.got : require("got");
			const cktough = globalThis.cktough ? globalThis.cktough : require("tough-cookie");
			const ckjar = globalThis.ckjar ? globalThis.ckjar : new cktough.CookieJar();
			if (request) {
				request.headers = request.headers ? request.headers : {};
				if (undefined === request.headers.Cookie && undefined === request.cookieJar) request.cookieJar = ckjar;
			}
			const { url, ...option } = request;
			return await got[method](url, option)
				.on("redirect", (response, nextOpts) => {
					try {
						if (response.headers["set-cookie"]) {
							const ck = response.headers["set-cookie"].map(cktough.Cookie.parse).toString();
							if (ck) ckjar.setCookieSync(ck, null);
							nextOpts.cookieJar = ckjar;
						}
					} catch (e) {
						logError(e);
					}
					// ckjar.setCookieSync(response.headers["set-cookie"].map(Cookie.parse).toString())
				})
				.then(
					response => {
						response.statusCode = response.status;
						response.body = iconv.decode(response.rawBody, "utf-8");
						response.bodyBytes = response.rawBody;
						return response;
					},
					error => Promise.reject(error.message),
				);
		}
	}
}
