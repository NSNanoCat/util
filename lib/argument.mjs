import { Console } from "../polyfill/Console.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";

(() => {
	Console.debug(`☑️ $argument`);
	let argument = {};
	switch (typeof $argument) {
		// biome-ignore lint/suspicious/noFallthroughSwitchClause: String arguments are parsed then handled as objects via fall-through.
		case "string":
			argument = Object.fromEntries($argument.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
		case "object":
			{
				let source = argument;
				if (typeof $argument === "object") source = $argument;
				if (source !== null) {
					const parsed = {};
					// 数组按对象处理以支持索引键。
					Object.keys(source).forEach(key => _.set(parsed, key, source[key]));
					argument = parsed;
				}
			}
			break;
		case "undefined":
			argument = {};
			break;
	}
	globalThis.$argument = argument;
	if (argument?.LogLevel) Console.logLevel = argument.LogLevel;
	Console.debug(`✅ $argument`, `$argument: ${JSON.stringify(argument)}`);
})();
