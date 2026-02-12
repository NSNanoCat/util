import { Console } from "../polyfill/Console.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";

export function argument(value) {
	Console.debug(`☑️ $argument`);
	const argument = {};
	let target = value;
	const useGlobalArgument = typeof target === "undefined" && typeof $argument !== "undefined";
	if (useGlobalArgument) target = $argument;
	switch (typeof target) {
		// biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
		case "string":
			target = Object.fromEntries(target.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
			if (useGlobalArgument) $argument = target;
		case "object":
			Object.keys(target).forEach(key => _.set(argument, key, target[key]));
			break;
		case "undefined":
			break;
	}
	if (argument.LogLevel) Console.logLevel = argument.LogLevel;
	Console.debug(`✅ $argument`, `argument: ${JSON.stringify(argument)}`);
	return argument;
}
