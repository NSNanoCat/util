import "./lib/argument.mjs";
import { Console } from "./polyfill/Console.mjs";
import { Lodash as _ } from "./polyfill/Lodash.mjs";
import { Storage } from "./polyfill/Storage.mjs";

/**
 * 存储配置读取与合并结果。
 * Merged storage result object.
 *
 * @typedef {object} StorageProfile
 * @property {Record<string, any>} Settings 运行设置 / Runtime settings.
 * @property {Record<string, any>} Configs 静态配置 / Static configs.
 * @property {Record<string, any>} Caches 缓存数据 / Runtime caches.
 */

/**
 * 读取并合并默认配置、持久化配置与 `$argument`。
 * Read and merge default config, persisted config and `$argument`.
 *
 * 合并顺序:
 * Merge order:
 * 1) `database.Default`
 * 2) BoxJS persisted value
 * 3) `database[name]` + `BoxJs[name]`
 * 4) `$argument`
 *
 * @link https://github.com/NanoCat-Me/utils/blob/main/getStorage.mjs
 * @author VirgilClyne
 * @param {string} key 持久化主键 / Persistent store key.
 * @param {string|string[]|Array<string|string[]>} names 目标配置名 / Target profile names.
 * @param {Record<string, any>} database 默认数据库 / Default database object.
 * @returns {StorageProfile}
 */
export function getStorage(key, names, database) {
	if (database?.Default?.Settings?.LogLevel) Console.logLevel = database.Default.Settings.LogLevel;
	Console.debug("☑️ getStorage");
	names = [names].flat(Number.POSITIVE_INFINITY);
	/***************** Default *****************/
	const Root = { Settings: database?.Default?.Settings || {}, Configs: database?.Default?.Configs || {}, Caches: {} };
	Console.debug("Default", `Root.Settings类型: ${typeof Root.Settings}`, `Root.Settings: ${JSON.stringify(Root.Settings)}`);
	/***************** BoxJs *****************/
	// 包装为局部变量，用完释放内存
	// BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
	const BoxJs = Storage.getItem(key);
	if (BoxJs) {
		Console.debug("☑️ BoxJs", `BoxJs类型: ${typeof BoxJs}`, `BoxJs内容: ${JSON.stringify(BoxJs || {})}`);
		names.forEach(name => {
			if (typeof BoxJs?.[name]?.Settings === "string") {
				BoxJs[name].Settings = JSON.parse(BoxJs[name].Settings || "{}");
			}
			if (typeof BoxJs?.[name]?.Caches === "string") {
				BoxJs[name].Caches = JSON.parse(BoxJs[name].Caches || "{}");
			}
		});
		if (BoxJs.LogLevel) Console.logLevel = BoxJs.LogLevel;
		Console.debug("✅ BoxJs", `Root.Settings类型: ${typeof Root.Settings}`, `Root.Settings: ${JSON.stringify(Root.Settings)}`);
	}
	/***************** Merge *****************/
	names.forEach(name => {
		_.merge(Root.Settings, database?.[name]?.Settings, $argument, BoxJs?.[name]?.Settings);
		_.merge(Root.Configs, database?.[name]?.Configs);
		_.merge(Root.Caches, BoxJs?.[name]?.Caches);
	});
	if ($argument.Storage === "$argument")  _.merge(Root.Settings, $argument);
	if (Root.Settings.LogLevel) Console.logLevel = Root.Settings.LogLevel;
	Console.debug("✅ Merge", `Root.Settings类型: ${typeof Root.Settings}`, `Root.Settings: ${JSON.stringify(Root.Settings)}`);
	/***************** traverseObject *****************/
	traverseObject(Root.Settings, (key, value) => {
		Console.debug("☑️ traverseObject", `${key}: ${typeof value}`, `${key}: ${JSON.stringify(value)}`);
		if (value === "true" || value === "false")
			value = JSON.parse(value); // 字符串转Boolean
		else if (typeof value === "string") {
			if (value.includes(","))
				value = value.split(",").map(item => string2number(item)); // 字符串转数组转数字
			else value = string2number(value); // 字符串转数字
		}
		return value;
	});
	Console.debug("✅ traverseObject", `Root.Settings类型: ${typeof Root.Settings}`, `Root.Settings: ${JSON.stringify(Root.Settings)}`);
	Console.debug("✅ getStorage");
	return Root;
}

/**
 * 深度遍历对象并用回调替换叶子值。
 * Deep-walk an object and replace leaf values using callback.
 *
 * @param {Record<string, any>} o 目标对象 / Target object.
 * @param {(key: string, value: any) => any} c 处理回调 / Transformer callback.
 * @returns {Record<string, any>}
 */
function traverseObject(o, c) {
	for (const t in o) {
		const n = o[t];
		o[t] = "object" === typeof n && null !== n ? traverseObject(n, c) : c(t, n);
	}
	return o;
}

/**
 * 将纯数字字符串转换为数字。
 * Convert integer-like string into number.
 *
 * @param {string} string 输入字符串 / Input string.
 * @returns {string|number}
 */
function string2number(string) {
	if (/^\d+$/.test(string)) string = Number.parseInt(string, 10);
	return string;
}
