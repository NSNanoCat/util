import { $app } from "../lib/app.mjs";
import { Lodash as _ } from "./Lodash.mjs";

/**
 * 跨平台持久化存储适配器。
 * Cross-platform persistent storage adapter.
 *
 * 设计目标:
 * Design goal:
 * - 仿照 Web Storage (`Storage`) 接口设计
 * - Modeled after Web Storage (`Storage`) interface
 * - 统一 VPN App 脚本环境中的持久化读写接口
 * - Unify persistence APIs across VPN app script environments
 *
 * 支持后端:
 * Supported backends:
 * - Surge/Loon/Stash/Egern/Shadowrocket: `$persistentStore`
 * - Quantumult X: `$prefs`
 * - Worker: 内存缓存（非持久化）
 * - Worker: in-memory cache (non-persistent)
 * - Node.js: 本地 `box.dat`
 * - Node.js: local `box.dat`
 *
 * 支持路径键:
 * Supports path key:
 * - `@root.path.to.value`
 *
 * 与 Web Storage 的已知差异:
 * Known differences from Web Storage:
 * - 支持 `@key.path` 深路径读写（Web Storage 原生不支持）
 * - Supports `@key.path` deep-path access (not native in Web Storage)
 * - `removeItem/clear` 并非所有平台都可用
 * - `removeItem/clear` are not available on every platform
 * - 读取时会尝试 `JSON.parse`，写入对象会 `JSON.stringify`
 * - Reads try `JSON.parse`, writes stringify objects
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Storage
 * @link https://developer.mozilla.org/zh-CN/docs/Web/API/Storage
 */
export class Storage {
	/**
	 * Worker / Node.js 环境下的内存数据缓存。
	 * In-memory data cache for Worker / Node.js runtime.
	 *
	 * @type {Record<string, any>|null}
	 */
	static data = null;

	/**
	 * Node.js 持久化文件名。
	 * Data file name used in Node.js.
	 *
	 * @type {string}
	 */
	static dataFile = "box.dat";

	/**
	 * `@key.path` 解析正则。
	 * Regex for `@key.path` parsing.
	 *
	 * @type {RegExp}
	 */
	static #nameRegex = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;

	/**
	 * 读取存储值。
	 * Read value from persistent storage.
	 *
	 * @param {string} keyName 键名或路径键 / Key or path key.
	 * @param {*} [defaultValue=null] 默认值 / Default value when key is missing.
	 * @returns {*}
	 */
	static getItem(keyName, defaultValue = null) {
		let keyValue = defaultValue;
		// 如果以 @
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(Storage.#nameRegex)?.groups;
				keyName = key;
				let value = Storage.getItem(keyName, {});
				if (typeof value !== "object") value = {};
				keyValue = _.get(value, path);
				try {
					keyValue = JSON.parse(keyValue);
				} catch {}
				break;
			}
			default:
				switch ($app) {
					case "Surge":
					case "Loon":
					case "Stash":
					case "Egern":
					case "Shadowrocket":
						keyValue = $persistentStore.read(keyName);
						break;
					case "Quantumult X":
						keyValue = $prefs.valueForKey(keyName);
						break;
					case "Worker":
						Storage.data = Storage.data ?? {};
						keyValue = Storage.data[keyName];
						break;
					case "Node.js":
						throw new Error(`${Storage.name}.getItem: ESM 版本不支持 Node.js，请改用 CJS 入口`);
					default:
						keyValue = Storage.data?.[keyName] || null;
						break;
				}
				try {
					keyValue = JSON.parse(keyValue);
				} catch {
					// do nothing
				}
				break;
		}
		return keyValue ?? defaultValue;
	}

	/**
	 * 写入存储值。
	 * Write value into persistent storage.
	 *
	 * @param {string} keyName 键名或路径键 / Key or path key.
	 * @param {*} keyValue 写入值 / Value to store.
	 * @returns {boolean}
	 */
	static setItem(keyName = new String(), keyValue = new String()) {
		let result = false;
		switch (typeof keyValue) {
			case "object":
				keyValue = JSON.stringify(keyValue);
				break;
			default:
				keyValue = String(keyValue);
				break;
		}
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(Storage.#nameRegex)?.groups;
				keyName = key;
				let value = Storage.getItem(keyName, {});
				if (typeof value !== "object") value = {};
				_.set(value, path, keyValue);
				result = Storage.setItem(keyName, value);
				break;
			}
			default:
				switch ($app) {
					case "Surge":
					case "Loon":
					case "Stash":
					case "Egern":
					case "Shadowrocket":
						result = $persistentStore.write(keyValue, keyName);
						break;
					case "Quantumult X":
						result = $prefs.setValueForKey(keyValue, keyName);
						break;
					case "Worker":
						Storage.data = Storage.data ?? {};
						Storage.data[keyName] = keyValue;
						result = true;
						break;
					case "Node.js":
						throw new Error(`${Storage.name}.setItem: ESM 版本不支持 Node.js，请改用 CJS 入口`);
					default:
						result = Storage.data?.[keyName] || null;
						break;
				}
				break;
		}
		return result;
	}

	/**
	 * 删除存储值。
	 * Remove value from persistent storage.
	 *
	 * 平台说明:
	 * Platform notes:
	 * - Quantumult X: `$prefs.removeValueForKey`
	 * - Surge: 通过 `$persistentStore.write(null, keyName)` 删除
	 * - 其余平台当前返回 `false`
	 *
	 * @param {string} keyName 键名或路径键 / Key or path key.
	 * @returns {boolean}
	 */
	static removeItem(keyName) {
		let result = false;
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(Storage.#nameRegex)?.groups;
				keyName = key;
				let value = Storage.getItem(keyName);
				if (typeof value !== "object") value = {};
				_.unset(value, path);
				result = Storage.setItem(keyName, value);
				break;
			}
			default:
				switch ($app) {
					case "Surge":
						result = $persistentStore.write(null, keyName);
						break;
					case "Loon":
					case "Stash":
					case "Egern":
					case "Shadowrocket":
						result = false;
						break;
					case "Quantumult X":
						result = $prefs.removeValueForKey(keyName);
						break;
					case "Worker":
						Storage.data = Storage.data ?? {};
						delete Storage.data[keyName];
						result = true;
						break;
					case "Node.js":
						throw new Error(`${Storage.name}.removeItem: ESM 版本不支持 Node.js，请改用 CJS 入口`);
					default:
						result = false;
						break;
				}
				break;
		}
		return result;
	}

	/**
	 * 清空存储。
	 * Clear storage.
	 *
	 * @returns {boolean}
	 */
	static clear() {
		let result = false;
		switch ($app) {
			case "Surge":
			case "Loon":
			case "Stash":
			case "Egern":
			case "Shadowrocket":
				result = false;
				break;
			case "Quantumult X":
				result = $prefs.removeAllValues();
				break;
			case "Worker":
				Storage.data = {};
				result = true;
				break;
			case "Node.js":
				throw new Error(`${Storage.name}.clear: ESM 版本不支持 Node.js，请改用 CJS 入口`);
			default:
				result = false;
				break;
		}
		return result;
	}

}
