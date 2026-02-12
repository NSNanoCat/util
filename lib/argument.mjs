import { Console } from "../polyfill/Console.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";

const parseArgument = () => {
	Console.debug(`☑️ $argument`);
	const argument = {};
let target = globalThis.$argument;
	if (typeof target === "string") {
		target = Object.fromEntries(target.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
		globalThis.$argument = target;
	}
	if (target && typeof target === "object") {
		Object.keys(target).forEach(key => _.set(argument, key, target[key]));
	}
	if (argument.LogLevel) Console.logLevel = argument.LogLevel;
	Console.debug(`✅ $argument`, `argument: ${JSON.stringify(argument)}`);
	return argument;
};

export const argument = parseArgument();
