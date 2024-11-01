import { $platform, log } from "./index.js";
import { Lodash as _ } from "../polyfill/index.js";

export function done(object = {}) {
	switch ($platform) {
		case "Surge":
			if (object.policy) _.set(object, "headers.X-Surge-Policy", object.policy);
			log("", `🚩 执行结束! 🕛 ${new Date().getTime() / 1000 - $script.startTime} 秒`, "");
			$done(object);
			break;
		case "Loon":
			if (object.policy) object.node = object.policy;
			log("", `🚩 执行结束! 🕛 ${(new Date() - $script.startTime) / 1000} 秒`, "");
			$done(object);
			break;
		case "Stash":
			if (object.policy) _.set(object, "headers.X-Stash-Selected-Proxy", encodeURI(object.policy));
			log("", `🚩 执行结束! 🕛 ${(new Date() - $script.startTime) / 1000} 秒`, "");
			$done(object);
			break;
		case "Egern":
			log("", "🚩 执行结束!", "");
			$done(object);
			break;
		case "Shadowrocket":
		default:
			log("", "🚩 执行结束!", "");
			$done(object);
			break;
		case "Quantumult X":
			if (object.policy) _.set(object, "opts.policy", object.policy);
			// 移除不可写字段
			object["auto-redirect"] = undefined;
			object["auto-cookie"] = undefined;
			object["binary-mode"] = undefined;
			object.charset = undefined;
			object.host = undefined;
			object.insecure = undefined;
			object.method = undefined; // 1.4.x 不可写
			object.ok = undefined; // 来自fetch()的响应对象, 不可写
			object.opt = undefined; // $task.fetch() 参数, 不可写
			object.path = undefined; // 可写, 但会与 url 冲突
			object.policy = undefined;
			object["policy-descriptor"] = undefined;
			object.scheme = undefined;
			object.sessionIndex = undefined;
			object.statusCode = undefined;
			object.timeout = undefined;
			if (object.body instanceof ArrayBuffer) {
				object.bodyBytes = object.body;
				object.body = undefined;
			} else if (ArrayBuffer.isView(object.body)) {
				object.bodyBytes = object.body.buffer.slice(object.body.byteOffset, object.body.byteLength + object.body.byteOffset);
				object.body = undefined;
			} else if (object.body) object.bodyBytes = undefined;
			log("", "🚩 执行结束!", "");
			$done(object);
			break;
		case "Node.js":
			log("", "🚩 执行结束!", "");
			process.exit(1);
			break;
	}
}
