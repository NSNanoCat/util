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
 *
 * 归一化规则补充:
 * Normalization details:
 * - 使用 `globalThis.$argument` 读写，避免运行环境下未声明变量引用问题
 * - Read/write via `globalThis.$argument` to avoid undeclared variable access
 * - 当 `$argument` 为 `null` 或 `undefined` 时，会重置为 `{}`
 * - When `$argument` is `null` or `undefined`, it is normalized to `{}`
 */
(() => {
	Console.debug("☑️ $argument");
	switch (typeof globalThis.$argument) {
		case "string": {
			const argument = Object.fromEntries(globalThis.$argument.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
			globalThis.$argument = {};
			Object.keys(argument).forEach(key => _.set(globalThis.$argument, key, argument[key]));
			break;
		}
		case "object": {
			if (globalThis.$argument === null) {
				globalThis.$argument = {};
				break;
			}
			const argument = {};
			Object.keys(globalThis.$argument).forEach(key => _.set(argument, key, globalThis.$argument[key]));
			globalThis.$argument = argument;
			break;
		}
		case "undefined":
			globalThis.$argument = {};
			break;
	}
	if (globalThis.$argument.LogLevel) Console.logLevel = globalThis.$argument.LogLevel;
	Console.debug("✅ $argument", `$argument: ${JSON.stringify(globalThis.$argument)}`);
})();
