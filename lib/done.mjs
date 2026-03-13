import { $app } from "./app.mjs";
import { Console } from "../polyfill/Console.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";
import { StatusTexts } from "../polyfill/StatusTexts.mjs";

/**
 * `done` 的统一入参结构。
 * Unified `done` input payload.
 *
 * @typedef {object} DonePayload
 * @property {number|string} [status] 响应状态码或状态行 / Response status code or status line.
 * @property {string} [url] 响应 URL / Response URL.
 * @property {Record<string, any>} [headers] 响应头 / Response headers.
 * @property {string|ArrayBuffer|ArrayBufferView} [body] 响应体 / Response body.
 * @property {ArrayBuffer} [bodyBytes] 二进制响应体 / Binary response body.
 * @property {string} [policy] 指定策略名 / Preferred policy name.
 */

/**
 * 结束脚本执行并按平台转换参数。
 * Complete script execution with platform-specific parameter mapping.
 *
 * 说明:
 * Notes:
 * - 这是调用入口，平台原生 `$done` 差异在内部处理
 * - This is the call entry and native `$done` differences are handled internally
 * - Worker 不调用 `$done` 或退出进程，仅记录日志
 * - Worker neither calls `$done` nor exits the process; it only logs
 * - Node.js 不调用 `$done`，而是直接退出进程
 * - Node.js does not call `$done`; it exits the process directly
 * - 未识别平台仅记录结束日志，不会强制退出
 * - Unknown runtimes only log completion and do not force an exit
 *
 * @param {DonePayload} [object={}] 统一响应对象 / Unified response object.
 * @returns {void}
 */
export function done(object = {}) {
	switch ($app) {
		case "Surge":
			if (object.policy) _.set(object, "headers.X-Surge-Policy", object.policy);
			Console.log("🚩 执行结束!", `🕛 ${new Date().getTime() / 1000 - $script.startTime} 秒`);
			$done(object);
			break;
		case "Loon":
			if (object.policy) object.node = object.policy;
			Console.log("🚩 执行结束!", `🕛 ${(new Date() - $script.startTime) / 1000} 秒`);
			$done(object);
			break;
		case "Stash":
			if (object.policy) _.set(object, "headers.X-Stash-Selected-Proxy", encodeURI(object.policy));
			Console.log("🚩 执行结束!", `🕛 ${(new Date() - $script.startTime) / 1000} 秒`);
			$done(object);
			break;
		case "Egern":
			Console.log("🚩 执行结束!");
			$done(object);
			break;
		case "Shadowrocket":
			Console.log("🚩 执行结束!");
			$done(object);
			break;
		case "Quantumult X":
			if (object.policy) _.set(object, "opts.policy", object.policy);
			object = _.pick(object, ["status", "url", "headers", "body", "bodyBytes"]);
			switch (typeof object.status) {
				case "number":
					object.status = `HTTP/1.1 ${object.status} ${StatusTexts[object.status]}`;
					break;
				case "string":
				case "undefined":
					break;
				default:
					throw new TypeError(`${Function.name}: 参数类型错误, status 必须为数字或字符串`);
			}
			if (object.body instanceof ArrayBuffer) {
				object.bodyBytes = object.body;
				object.body = undefined;
			} else if (ArrayBuffer.isView(object.body)) {
				object.bodyBytes = object.body.buffer.slice(object.body.byteOffset, object.body.byteLength + object.body.byteOffset);
				object.body = undefined;
			} else if (object.body) object.bodyBytes = undefined;
			Console.log("🚩 执行结束!");
			$done(object);
			break;
		case "Worker":
			Console.log("🚩 执行结束!");
			break;
		case "Node.js":
			Console.log("🚩 执行结束!");
			process.exit(1);
			break;
		default:
			Console.log("🚩 执行结束!");
			break;
	}
}
