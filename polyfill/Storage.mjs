import { Lodash as _, } from "./Lodash.mjs";
import { $app, log } from "../index.js";

/* https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/setItem */
export class Storage {
	static data = null;
	static dataFile = "box.dat";
	static #nameRegex = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;

	static getItem(keyName = new String(), defaultValue = null) {
		let keyValue = defaultValue;
		// 如果以 @
		switch (keyName.startsWith("@")) {
			case true: {
				const { key, path } = keyName.match(Storage.#nameRegex)?.groups;
				//log(`1: ${key}, ${path}`);
				keyName = key;
				let value = Storage.getItem(keyName, {});
				//log(`2: ${JSON.stringify(value)}`)
				if (typeof value !== "object") value = {};
				//log(`3: ${JSON.stringify(value)}`)
				keyValue = _.get(value, path);
				//log(`4: ${JSON.stringify(keyValue)}`)
				try {
					keyValue = JSON.parse(keyValue);
				} catch (e) {
					// do nothing
				}
				//log(`5: ${JSON.stringify(keyValue)}`)
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

	static setItem(keyName = new String(), keyValue = new String()) {
		let result = false;
		//log(`0: ${typeof keyValue}`);
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
				//log(`1: ${key}, ${path}`);
				keyName = key;
				let value = Storage.getItem(keyName, {});
				//log(`2: ${JSON.stringify(value)}`)
				if (typeof value !== "object") value = {};
				//log(`3: ${JSON.stringify(value)}`)
				_.set(value, path, keyValue);
				//log(`4: ${JSON.stringify(value)}`)
				result = Storage.setItem(keyName, value);
				//log(`5: ${result}`)
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

	static #loaddata = (dataFile) => {
		if ($app === "Node.js") {
			this.fs = this.fs ? this.fs : require("fs");
			this.path = this.path ? this.path : require("path");
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
	}

	static #writedata = (dataFile = this.dataFile) => {
		if ($app === "Node.js") {
			this.fs = this.fs ? this.fs : require("fs");
			this.path = this.path ? this.path : require("path");
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
	}
}
