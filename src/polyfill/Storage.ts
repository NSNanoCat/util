import { get, set, unset } from './Lodash';
import { $app } from '../lib/app';

declare const $persistentStore: {
  read: (key: string) => string | null;
  write: (value: string, key: string) => boolean;
};

declare const $prefs: {
  valueForKey: (key: string) => string | null;
  setValueForKey: (value: string, key: string) => boolean;
  removeValueForKey: (key: string) => boolean;
  removeAllValues: () => boolean;
};

interface StorageData {
  [key: string]: any;
}

export class StorageClass {
  private data: StorageData | null = null;
  private readonly dataFile: string = 'box.dat';
  private readonly nameRegex = /^@(?<key>[^.]+)(?:\.(?<path>.*))?$/;

  constructor() {
    if ($app === 'Node.js') {
      const fs = require('node:fs');
      const path = require('node:path');
      this.data = this.#loadData(this.dataFile, fs, path);
    }
  }

  public getItem<T = any>(keyName: string, defaultValue = null as T): T {
    let keyValue = defaultValue;

    if (keyName.startsWith('@')) {
      const { key, path } = keyName.match(this.nameRegex)?.groups || {};
      if (key) {
        let value = this.getItem(key, {});
        if (typeof value !== 'object') {
          value = {};
        }
        keyValue = get(value, path);
        try {
          keyValue = JSON.parse(keyValue as string);
        } catch {
          // Ignore parse error
        }
      }
    } else {
      switch ($app) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Egern':
        case 'Shadowrocket':
          keyValue = $persistentStore.read(keyName) as T;
          break;
        case 'Quantumult X':
          keyValue = $prefs.valueForKey(keyName) as T;
          break;
        case 'Node.js':
          this.data = this.data || {};
          keyValue = this.data[keyName];
          break;
        default:
          keyValue = null as T;
          break;
      }

      try {
        keyValue = JSON.parse(keyValue as string);
      } catch {
        // Ignore parse error
      }
    }

    return keyValue ?? defaultValue;
  }

  public setItem(keyName: string, value: any): boolean {
    let keyValue = value;
    if (typeof keyValue === 'object') {
      keyValue = JSON.stringify(keyValue);
    } else {
      keyValue = String(keyValue);
    }

    if (keyName.startsWith('@')) {
      const { key, path } = keyName.match(this.nameRegex)?.groups || {};
      if (key) {
        let value = this.getItem(key, {});
        if (typeof value !== 'object') value = {};
        set(value, path, keyValue);
        return this.setItem(keyName, value);
      }
    } else {
      switch ($app) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Egern':
        case 'Shadowrocket':
          return $persistentStore.write(keyValue, keyName);
        case 'Quantumult X':
          return $prefs.setValueForKey(keyValue, keyName);
        case 'Node.js':
          this.data = this.data || {};
          this.data[keyName] = keyValue;
          this.#writeData(this.dataFile);
          return true;
        default:
          return false;
      }
    }

    return false;
  }

  public removeItem(keyName: string): boolean {
    if (keyName.startsWith('@')) {
      const { key, path } = keyName.match(this.nameRegex)?.groups || {};
      if (key) {
        let value = this.getItem(key);
        if (typeof value !== 'object') value = {};
        unset(value, path);
        return this.setItem(key, value);
      }
    } else {
      switch ($app) {
        case 'Quantumult X':
          return $prefs.removeValueForKey(keyName);
        default:
          return false;
      }
    }

    return false;
  }

  public clear(): boolean {
    switch ($app) {
      case 'Quantumult X':
        return $prefs.removeAllValues();
      default:
        return false;
    }
  }

  #loadData(dataFile: string, fs: any, path: any): StorageData {
    const curDirDataFilePath = path.resolve(dataFile);
    const rootDirDataFilePath = path.resolve(process.cwd(), dataFile);
    if (fs.existsSync(curDirDataFilePath)) {
      return JSON.parse(fs.readFileSync(curDirDataFilePath, 'utf-8')) || {};
    }
    if (fs.existsSync(rootDirDataFilePath)) {
      return JSON.parse(fs.readFileSync(rootDirDataFilePath, 'utf-8')) || {};
    }
    return {};
  }

  #writeData(dataFile: string): void {
    if ($app === 'Node.js') {
      const fs = require('node:fs');
      const path = require('node:path');
      const dataFilePath = path.resolve(dataFile);
      fs.writeFileSync(dataFilePath, JSON.stringify(this.data), 'utf-8');
    }
  }
}

// 导出初始化后的实例
export const Storage = new StorageClass();
