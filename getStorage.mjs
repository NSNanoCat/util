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
 * 注意：`Configs` 与 `Caches` 始终按每个 profile（`names`）合并；`Settings` 的合并顺序由 `$argument.Storage` 控制。
 * Note: `Configs` and `Caches` are always merged per-profile (`names`); the merge order for `Settings` is controlled by `$argument.Storage`.
 *
 * 合并来源与顺序由 `$argument.Storage` 控制:
 * Merge source order is controlled by `$argument.Storage`:
 * - `undefined`: `database[name]` -> `$argument` -> `PersistentStore[name]`
 * - `$argument`: `database[name]` -> `PersistentStore[name]` -> `$argument`
 * - `PersistentStore` / `BoxJs`(默认): `database[name]` -> `PersistentStore[name]`
 * - `database`: 仅 `database[name]`
 *
 * @since 2.1.3
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
	/***************** PersistentStore *****************/
	// 包装为局部变量，用完释放内存
	// BoxJs 的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
	const PersistentStore = Storage.getItem(key, {});
	if (PersistentStore) {
		Console.debug("☑️ PersistentStore", `PersistentStore类型: ${typeof PersistentStore}`, `PersistentStore内容: ${JSON.stringify(PersistentStore || {})}`);
		names.forEach(name => {
			if (typeof PersistentStore?.[name]?.Settings === "string") {
				PersistentStore[name].Settings = JSON.parse(PersistentStore[name].Settings || "{}");
			}
			if (typeof PersistentStore?.[name]?.Caches === "string") {
				PersistentStore[name].Caches = JSON.parse(PersistentStore[name].Caches || "{}");
			}
		});
		if (PersistentStore.LogLevel) Console.logLevel = PersistentStore.LogLevel;
		Console.debug("✅ PersistentStore", `Root.Settings类型: ${typeof Root.Settings}`, `Root.Settings: ${JSON.stringify(Root.Settings)}`);
	}
	/***************** Merge *****************/
	names.forEach(name => {
		_.merge(Root.Configs, database?.[name]?.Configs);
		_.merge(Root.Caches, PersistentStore?.[name]?.Caches);
	});
	switch ($argument.Storage) {
		case "$argument":
			names.forEach(name => {
				_.merge(Root.Settings, database?.[name]?.Settings, PersistentStore?.[name]?.Settings);
			});
			_.merge(Root.Settings, $argument);
			break;
		default:
		case "BoxJs":
		case "PersistentStore":
			names.forEach(name => {
				_.merge(Root.Settings, database?.[name]?.Settings, PersistentStore?.[name]?.Settings);
			});
			break;
		case "database":
			names.forEach(name => {
				_.merge(Root.Settings, database?.[name]?.Settings);
			});
			break;
		case undefined:
			names.forEach(name => {
				_.merge(Root.Settings, database?.[name]?.Settings);
			});
			_.merge(Root.Settings, $argument);
			names.forEach(name => {
				_.merge(Root.Settings, PersistentStore?.[name]?.Settings);
			});
			break;
	}
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
