import { Console } from "../polyfill/Console.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";

(() => {
	Console.debug(`☑️ $argument`);
	let target = globalThis.$argument;
	switch (typeof target) {
		// biome-ignore lint/suspicious/noFallthroughSwitchClause: String arguments are parsed then handled as objects.
		case "string":
			target = Object.fromEntries(target.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
		case "object":
			if (target !== null) {
				const parsed = {};
				// 数组按对象处理以支持索引键。
				Object.keys(target).forEach(key => _.set(parsed, key, target[key]));
				target = parsed;
			}
			break;
		default:
			break;
	}
	globalThis.$argument = target;
	if (target?.LogLevel) Console.logLevel = target.LogLevel;
	Console.debug(`✅ $argument`, `$argument: ${JSON.stringify(target)}`);
})();
