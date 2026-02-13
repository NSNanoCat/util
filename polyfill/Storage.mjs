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
	 * Node.js 环境下的内存数据缓存。
	 * In-memory data cache for Node.js runtime.
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
				} catch (e) {}
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
					case "Node.js":
						Storage.data = Storage.#loaddata(Storage.dataFile);
						keyValue = Storage.data?.[keyName];
						break;
					default:
						keyValue = Storage.data?.[keyName] || null;
						break;
				}
				try {
					keyValue = JSON.parse(keyValue);
				} catch (e) {
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
					case "Node.js":
						Storage.data = Storage.#loaddata(Storage.dataFile);
						Storage.data[keyName] = keyValue;
						Storage.#writedata(Storage.dataFile);
						result = true;
						break;
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
				keyValue = _.unset(value, path);
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
						result = false;
						break;
					case "Quantumult X":
						result = $prefs.removeValueForKey(keyName);
						break;
					case "Node.js":
						result = false;
						break;
					default:
						result = false;
						break;
				}
				break;
		}
		return result;
	}

	/**
	 * 清空存储（仅 Quantumult X 支持）。
	 * Clear storage (supported by Quantumult X only).
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
			case "Node.js":
				result = false;
				break;
			default:
				result = false;
				break;
		}
		return result;
	}

	/**
	 * 从 Node.js 数据文件加载 JSON。
	 * Load JSON data from Node.js data file.
	 *
	 * @private
	 * @param {string} dataFile 数据文件名 / Data file name.
	 * @returns {Record<string, any>}
	 */
	static #loaddata = dataFile => {
		if ($app === "Node.js") {
			this.fs = this.fs ? this.fs : require("node:fs");
			this.path = this.path ? this.path : require("node:path");
			const curDirDataFilePath = this.path.resolve(dataFile);
			const rootDirDataFilePath = this.path.resolve(process.cwd(), dataFile);
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
			const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
			if (isCurDirDataFile || isRootDirDataFile) {
				const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath;
				try {
					return JSON.parse(this.fs.readFileSync(datPath));
				} catch (e) {
					return {};
				}
			} else return {};
		} else return {};
	};

	/**
	 * 将内存数据写入 Node.js 数据文件。
	 * Persist in-memory data to Node.js data file.
	 *
	 * @private
	 * @param {string} [dataFile=this.dataFile] 数据文件名 / Data file name.
	 * @returns {void}
	 */
	static #writedata = (dataFile = this.dataFile) => {
		if ($app === "Node.js") {
			this.fs = this.fs ? this.fs : require("node:fs");
			this.path = this.path ? this.path : require("node:path");
			const curDirDataFilePath = this.path.resolve(dataFile);
			const rootDirDataFilePath = this.path.resolve(process.cwd(), dataFile);
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
			const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
			const jsondata = JSON.stringify(this.data);
			if (isCurDirDataFile) {
				this.fs.writeFileSync(curDirDataFilePath, jsondata);
			} else if (isRootDirDataFile) {
				this.fs.writeFileSync(rootDirDataFilePath, jsondata);
			} else {
				this.fs.writeFileSync(curDirDataFilePath, jsondata);
			}
		}
	};
}
