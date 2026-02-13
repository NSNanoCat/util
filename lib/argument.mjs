import { Console } from "../polyfill/Console.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";

(() => {
	Console.debug("☑️ $argument");
	switch (typeof $argument) {
		// biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
		case "string": {
			const argument = Object.fromEntries($argument.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
			$argument = {};
			Object.keys(argument).forEach(key => _.set($argument, key, argument[key]));
			break;
		}
		case "object": {
			const argument = $argument;
			Object.keys(argument ?? $argument).forEach(key => _.set(argument, key, $argument[key]));
			break;
		}
		case "undefined":
			break;
	}
	if ($argument.LogLevel) Console.logLevel = $argument.LogLevel;
	Console.debug("✅ $argument", `$argument: ${JSON.stringify($argument)}`);
})();
