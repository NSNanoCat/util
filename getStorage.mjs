import { _, Storage, log } from ".";

/**
 * Get Storage Variables
 * @link https://github.com/NanoCat-Me/utils/blob/main/getStorage.mjs
 * @author VirgilClyne
 * @param {String} key - Persistent Store Key
 * @param {Array} names - Platform Names
 * @param {Object} database - Default Database
 * @return {Object} { Settings, Caches, Configs }
 */
export default function getStorage(key, names, database) {
	//log(`☑️ getStorage, Get Environment Variables`, "");
	/***************** Default *****************/
	const Store = { Settings: database?.Default?.Settings || {}, Configs: database?.Default?.Configs || {}, Caches: {} };
	/***************** Database *****************/
	[names].flat(Number.POSITIVE_INFINITY).forEach(name => {
		Store.Settings = { ...Store.Settings, ...database?.[name]?.Settings };
		Store.Configs = { ...Store.Configs, ...database?.[name]?.Configs };
	});
	/***************** Argument *****************/
	switch (typeof $argument) {
		case "string":
			$argument = Object.fromEntries($argument.split("&").map(item => item.split("=").map(i => i.replace(/\"/g, ""))));
		case "object": {
			const argument = {};
			Object.keys($argument).forEach(key => _.set(argument, key, $argument[key]));
			//log(`✅ getStorage, Get Environment Variables`, `argument: ${JSON.stringify(argument)}`, "");
			Store.Settings = { ...Store.Settings, ...argument };
			break;
		}
		case "undefined":
			break;
	}
	/***************** BoxJs *****************/
	// 包装为局部变量，用完释放内存
	// BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
	const BoxJs = Storage.getItem(key, database);
	//log(`🚧 getStorage, Get Environment Variables`, `BoxJs类型: ${typeof BoxJs}`, `BoxJs内容: ${JSON.stringify(BoxJs || {})}`, "");
	[names].flat(Number.POSITIVE_INFINITY).forEach(name => {
		switch (typeof BoxJs?.[name]?.Settings) {
			case "string":
				BoxJs[name].Settings = JSON.parse(BoxJs[name].Settings || "{}");
			case "object":
				Store.Settings = { ...Store.Settings, ...BoxJs[name].Settings };
				break;
			case "undefined":
				break;
		}
		switch (typeof BoxJs?.[name]?.Caches) {
			case "string":
				BoxJs[name].Caches = JSON.parse(BoxJs[name].Caches || "{}");
			case "object":
				Store.Caches = { ...Store.Caches, ...BoxJs[name].Caches };
				break;
			case "undefined":
				break;
		}
	});
	//log(`🚧 getStorage, Get Environment Variables`, `Store.Settings类型: ${typeof Store.Settings}`, `Store.Settings: ${JSON.stringify(Store.Settings)}`, "");
	/***************** traverseObject *****************/
	traverseObject(Store.Settings, (key, value) => {
		//log(`🚧 getStorage, traverseObject`, `${key}: ${typeof value}`, `${key}: ${JSON.stringify(value)}`, "");
		if (value === "true" || value === "false")
			value = JSON.parse(value); // 字符串转Boolean
		else if (typeof value === "string") {
			if (value.includes(","))
				value = value.split(",").map(item => string2number(item)); // 字符串转数组转数字
			else value = string2number(value); // 字符串转数字
		}
		return value;
	});
	//log(`✅ getStorage, Get Environment Variables`, `Store: ${typeof Store.Caches}`, `Store内容: ${JSON.stringify(Store)}`, "");
	return Store;
	/***************** function *****************/
	function traverseObject(o, c) {
		for (const t in o) {
			const n = o[t];
			o[t] = "object" === typeof n && null !== n ? traverseObject(n, c) : c(t, n);
		}
		return o;
	}
	function string2number(string) {
		if (string && !Number.isNaN(string)) string = Number.parseInt(string, 10);
		return string;
	}
}
