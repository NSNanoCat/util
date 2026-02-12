import { Console } from "../polyfill/Console.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";

const parseArgument = () => {
	Console.debug(`☑️ $argument`);
	let target = globalThis.$argument;
	if (typeof target !== "undefined") {
		if (typeof target === "string") {
			target = Object.fromEntries(target.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
		}
		if (target !== null && typeof target === "object") {
			const parsed = {};
			// 数组按对象处理以支持索引键。
			Object.keys(target).forEach(key => _.set(parsed, key, target[key]));
			target = parsed;
		}
		globalThis.$argument = target;
	}
	if (target?.LogLevel) Console.logLevel = target.LogLevel;
	Console.debug(`✅ $argument`, `$argument: ${JSON.stringify(target)}`);
	return target;
};

export const $argument = parseArgument();
