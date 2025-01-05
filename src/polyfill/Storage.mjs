import { $app } from '../lib/app.mjs';
import { Lodash as _ } from './Lodash.mjs';
export class Storage {
  static data = null;
  static dataFile = 'box.dat';
  static #nameRegex = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;
  static getItem(keyName, defaultValue = null) {
    let keyValue1 = defaultValue;
    switch (keyName.startsWith('@')) {
      case true: {
        const { key, path } = keyName.match(Storage.#nameRegex)?.groups;
        keyName = key;
        let value = Storage.getItem(keyName, {});
        if ('object' != typeof value) value = {};
        keyValue1 = _.get(value, path);
        try {
          keyValue1 = JSON.parse(keyValue1);
        } catch (e) {}
        break;
      }
      default:
        switch ($app) {
          case 'Surge':
          case 'Loon':
          case 'Stash':
          case 'Egern':
          case 'Shadowrocket':
            keyValue1 = $persistentStore.read(keyName);
            break;
          case 'Quantumult X':
            keyValue1 = $prefs.valueForKey(keyName);
            break;
          case 'Node.js':
            Storage.data = Storage.#loaddata(Storage.dataFile);
            keyValue1 = Storage.data?.[keyName];
            break;
          default:
            keyValue1 = Storage.data?.[keyName] || null;
            break;
        }
        try {
          keyValue1 = JSON.parse(keyValue1);
        } catch (e) {}
        break;
    }
    return keyValue1 ?? defaultValue;
  }
  static setItem(keyName = new String(), keyValue1 = new String()) {
    let result = false;
    switch (typeof keyValue1) {
      case 'object':
        keyValue1 = JSON.stringify(keyValue1);
        break;
      default:
        keyValue1 = String(keyValue1);
        break;
    }
    switch (keyName.startsWith('@')) {
      case true: {
        const { key, path } = keyName.match(Storage.#nameRegex)?.groups;
        keyName = key;
        let value = Storage.getItem(keyName, {});
        if ('object' != typeof value) value = {};
        _.set(value, path, keyValue1);
        result = Storage.setItem(keyName, value);
        break;
      }
      default:
        switch ($app) {
          case 'Surge':
          case 'Loon':
          case 'Stash':
          case 'Egern':
          case 'Shadowrocket':
            result = $persistentStore.write(keyValue1, keyName);
            break;
          case 'Quantumult X':
            result = $prefs.setValueForKey(keyValue1, keyName);
            break;
          case 'Node.js':
            Storage.data = Storage.#loaddata(Storage.dataFile);
            Storage.data[keyName] = keyValue1;
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
    switch (keyName.startsWith('@')) {
      case true: {
        const { key, path } = keyName.match(Storage.#nameRegex)?.groups;
        keyName = key;
        let value = Storage.getItem(keyName);
        if ('object' != typeof value) value = {};
        keyValue = _.unset(value, path);
        result = Storage.setItem(keyName, value);
        break;
      }
      default:
        switch ($app) {
          case 'Surge':
          case 'Loon':
          case 'Stash':
          case 'Egern':
          case 'Shadowrocket':
            result = false;
            break;
          case 'Quantumult X':
            result = $prefs.removeValueForKey(keyName);
            break;
          case 'Node.js':
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
      case 'Surge':
      case 'Loon':
      case 'Stash':
      case 'Egern':
      case 'Shadowrocket':
        result = false;
        break;
      case 'Quantumult X':
        result = $prefs.removeAllValues();
        break;
      case 'Node.js':
        result = false;
        break;
      default:
        result = false;
        break;
    }
    return result;
  }
  static #loaddata = (dataFile) => {
    if ('Node.js' !== $app) return {};
    {
      this.fs = this.fs ? this.fs : require('node:fs');
      this.path = this.path ? this.path : require('node:path');
      const curDirDataFilePath = this.path.resolve(dataFile);
      const rootDirDataFilePath = this.path.resolve(process.cwd(), dataFile);
      const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
      const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
      if (!isCurDirDataFile && !isRootDirDataFile) return {};
      {
        const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath;
        try {
          return JSON.parse(this.fs.readFileSync(datPath));
        } catch (e) {
          return {};
        }
      }
    }
  };
  static #writedata = (dataFile = this.dataFile) => {
    if ('Node.js' === $app) {
      this.fs = this.fs ? this.fs : require('node:fs');
      this.path = this.path ? this.path : require('node:path');
      const curDirDataFilePath = this.path.resolve(dataFile);
      const rootDirDataFilePath = this.path.resolve(process.cwd(), dataFile);
      const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
      const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
      const jsondata = JSON.stringify(this.data);
      if (isCurDirDataFile) this.fs.writeFileSync(curDirDataFilePath, jsondata);
      else if (isRootDirDataFile) this.fs.writeFileSync(rootDirDataFilePath, jsondata);
      else this.fs.writeFileSync(curDirDataFilePath, jsondata);
    }
  };
}
