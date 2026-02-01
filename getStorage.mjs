import { Console } from "./polyfill/Console.mjs";
import { Lodash as _ } from "./polyfill/Lodash.mjs";
import { Storage } from "./polyfill/Storage.mjs";

/**
 * Get Storage Variables
 * @link https://github.com/NanoCat-Me/utils/blob/main/getStorage.mjs
 * @author VirgilClyne
 * @param {string} key - Persistent Store Key
 * @param {array | string} names - Platform Names
 * @param {object} database - Default Database
 * @return {object} { Settings, Caches, Configs }
 */
export function getStorage(key, names, database) {
	names = [names].flat(Number.POSITIVE_INFINITY);
	//Console.log("☑️ getStorage");
	/***************** Default *****************/
	const Store = { Settings: database?.Default?.Settings || {}, Configs: database?.Default?.Configs || {}, Caches: {} };
	//Console.debug("Default", `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`);
	/***************** Database *****************/
	names.forEach(name => {
		_.merge(Store.Settings, database?.[name]?.Settings);
		_.merge(Store.Configs, database?.[name]?.Configs);
	});
	//Console.debug("Database", `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`);
	/***************** Argument *****************/
	switch (typeof $argument) {
		// biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
		case "string":
			$argument = Object.fromEntries($argument.split("&").map(item => item.split("=", 2).map(i => i.replace(/\"/g, ""))));
		case "object": {
			const argument = {};
			Object.keys($argument).forEach(key => _.set(argument, key, $argument[key]));
			//Console.debug(`✅ $argument`, `argument: ${JSON.stringify(argument)}`);
			Store.Settings = { ...Store.Settings, ...argument };
			break;
		}
		case "undefined":
			break;
	}
	//Console.debug("$argument", `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`);
	/***************** BoxJs *****************/
	// 包装为局部变量，用完释放内存
	// BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
	const BoxJs = Storage.getItem(key);
	if (BoxJs) {
		//Console.debug("BoxJs", `BoxJs类型: ${typeof BoxJs}`, `BoxJs内容: ${JSON.stringify(BoxJs || {})}`);
		names.forEach(name => {
			switch (typeof BoxJs?.[name]?.Settings) {
				// biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
				case "string":
					BoxJs[name].Settings = JSON.parse(BoxJs[name].Settings || "{}");
				case "object":
					Store.Settings = { ...Store.Settings, ...BoxJs[name].Settings };
					break;
				case "undefined":
					break;
			}
			switch (typeof BoxJs?.[name]?.Caches) {
				// biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
				case "string":
					BoxJs[name].Caches = JSON.parse(BoxJs[name].Caches || "{}");
				case "object":
					Store.Caches = { ...Store.Caches, ...BoxJs[name].Caches };
					break;
				case "undefined":
					break;
			}
		});
		//Console.debug("BoxJs", `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`);
	}
	/***************** traverseObject *****************/
	traverseObject(Store.Settings, (key, value) => {
		//Console.debug("☑️ traverseObject", `${key}: ${typeof value}`, `${key}: ${JSON.stringify(value)}`);
		if (value === "true" || value === "false")
			value = JSON.parse(value); // 字符串转Boolean
		else if (typeof value === "string") {
			if (value.includes(","))
				value = value.split(",").map(item => string2number(item)); // 字符串转数组转数字
			else value = string2number(value); // 字符串转数字
		}
		return value;
	});
	//Console.debug("✅ traverseObject", `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`);
	return Store;
}

function traverseObject(o, c) {
	for (const t in o) {
		const n = o[t];
		o[t] = "object" === typeof n && null !== n ? traverseObject(n, c) : c(t, n);
	}
	return o;
}
function string2number(string) {
	if (/^\d+$/.test(string)) string = Number.parseInt(string, 10);
	return string;
}
