import { Console } from "../polyfill/Console.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";

(() => {
	Console.debug(`☑️ $argument`);
	let argument = {};
	let source;
	switch (typeof $argument) {
		// biome-ignore lint/suspicious/noFallthroughSwitchClause: String arguments are parsed then handled as objects via fall-through.
		case "string":
			source = Object.fromEntries($argument.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
		case "object":
			if ($argument !== null) {
				const input = typeof $argument === "string" ? source : $argument;
				// 数组按对象处理以支持索引键。
				Object.keys(input).forEach(key => _.set(argument, key, input[key]));
			}
			break;
		case "undefined":
			break;
	}
	globalThis.$argument = argument;
	if (argument.LogLevel) Console.logLevel = argument.LogLevel;
	Console.debug(`✅ $argument`, `$argument: ${JSON.stringify(argument)}`);
})();
