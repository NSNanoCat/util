"use strict";

const { Lodash: _ } = require("./Lodash.mjs");

/**
 * 仅面向 Worker / Node.js 的持久化存储适配器（CJS 版本）。
 * Persistent storage adapter for Worker / Node.js only (CJS version).
 */
class Storage {
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
				if (typeof process !== "undefined" && process.versions?.node) {
					Storage.data = Storage.#loaddata(Storage.dataFile);
					keyValue = Storage.data?.[keyName];
				} else {
					Storage.data = Storage.data ?? {};
					keyValue = Storage.data[keyName];
				}
				try {
					keyValue = JSON.parse(keyValue);
				} catch {}
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
				if (typeof process !== "undefined" && process.versions?.node) {
					Storage.data = Storage.#loaddata(Storage.dataFile);
					Storage.data[keyName] = keyValue;
					Storage.#writedata(Storage.dataFile);
					result = true;
				} else {
					Storage.data = Storage.data ?? {};
					Storage.data[keyName] = keyValue;
					result = true;
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
				_.unset(value, path);
				result = Storage.setItem(keyName, value);
				break;
			}
			default:
				if (typeof process !== "undefined" && process.versions?.node) {
					Storage.data = Storage.#loaddata(Storage.dataFile);
					delete Storage.data[keyName];
					Storage.#writedata(Storage.dataFile);
					result = true;
				} else {
					Storage.data = Storage.data ?? {};
					delete Storage.data[keyName];
					result = true;
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
		if (typeof process !== "undefined" && process.versions?.node) {
			Storage.data = Storage.#loaddata(Storage.dataFile);
			Storage.data = {};
			Storage.#writedata(Storage.dataFile);
			return true;
		}
		Storage.data = {};
		return true;
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
		const fs = require("node:fs");
		const path = require("node:path");
		const curDirDataFilePath = path.resolve(dataFile);
		const rootDirDataFilePath = path.resolve(process.cwd(), dataFile);
		const isCurDirDataFile = fs.existsSync(curDirDataFilePath);
		const isRootDirDataFile = !isCurDirDataFile && fs.existsSync(rootDirDataFilePath);
		if (isCurDirDataFile || isRootDirDataFile) {
			const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath;
			try {
				return JSON.parse(fs.readFileSync(datPath));
			} catch {
				return {};
			}
		}
		return {};
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
		const fs = require("node:fs");
		const path = require("node:path");
		const curDirDataFilePath = path.resolve(dataFile);
		const rootDirDataFilePath = path.resolve(process.cwd(), dataFile);
		const isCurDirDataFile = fs.existsSync(curDirDataFilePath);
		const isRootDirDataFile = !isCurDirDataFile && fs.existsSync(rootDirDataFilePath);
		const jsondata = JSON.stringify(this.data);
		if (isCurDirDataFile) {
			fs.writeFileSync(curDirDataFilePath, jsondata);
		} else if (isRootDirDataFile) {
			fs.writeFileSync(rootDirDataFilePath, jsondata);
		} else {
			fs.writeFileSync(curDirDataFilePath, jsondata);
		}
	};
}

module.exports = { Storage };
