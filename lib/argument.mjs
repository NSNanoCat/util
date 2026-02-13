import { Console } from "../polyfill/Console.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";

/**
 * 统一 `$argument` 输入格式并展开深路径。
 * Normalize `$argument` input format and expand deep paths.
 *
 * 平台差异:
 * Platform differences:
 * - Surge / Stash / Egern 常见为字符串参数: `a=1&b=2`
 * - Surge / Stash / Egern usually pass string args: `a=1&b=2`
 * - Loon 支持字符串和对象两种形态
 * - Loon supports both string and object forms
 * - Quantumult X / Shadowrocket 一般不提供 `$argument`
 * - Quantumult X / Shadowrocket usually do not expose `$argument`
 *
 * 执行时机:
 * Execution timing:
 * - 该模块为即时执行模块，`import` 时立即处理全局 `$argument`
 * - This module executes immediately and mutates global `$argument` on import
 */
(() => {
	Console.debug("☑️ $argument");
	switch (typeof $argument) {
		case "string": {
			const argument = Object.fromEntries($argument.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
			$argument = {};
			Object.keys(argument).forEach(key => _.set($argument, key, argument[key]));
			break;
		}
		case "object": {
			const argument = {};
			Object.keys($argument).forEach(key => _.set(argument, key, $argument[key]));
			$argument = argument;
			break;
		}
		case "undefined":
			break;
	}
	if ($argument.LogLevel) Console.logLevel = $argument.LogLevel;
	Console.debug("✅ $argument", `$argument: ${JSON.stringify($argument)}`);
})();
