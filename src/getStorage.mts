import { set } from './polyfill/Lodash.mjs';
import { Storage } from './polyfill/Storage.mjs';

type Database = Record<string, StoreType>;

interface StoreType<
  Settings extends Record<string, any> = Record<string, any>,
  Configs extends Record<string, any> = Record<string, any>,
  Caches extends Record<string, any> = Record<string, any>,
> {
  Settings: Settings;
  Configs: Configs;
  Caches: Caches;
}

declare const $argument: string | object;

export function getStorage<
  Settings extends Record<string, any> = Record<string, any>,
  Configs extends Record<string, any> = Record<string, any>,
  Caches extends Record<string, any> = Record<string, any>,
>(key: string, names: string | string[], database: Database): StoreType<Settings, Configs, Caches> {
  const nameList = Array.isArray(names) ? names : [names];

  const Store = {
    Settings: database?.Default?.Settings || {},
    Configs: database?.Default?.Configs || {},
    Caches: {},
  } as StoreType<Settings, Configs, Caches>;

  nameList.forEach((name) => {
    Store.Settings = { ...Store.Settings, ...database?.[name]?.Settings };
    Store.Configs = { ...Store.Configs, ...database?.[name]?.Configs };
  });

  if (typeof $argument === 'string') {
    const parsedArgument = Object.fromEntries(
      $argument.split('&').map((item) => item.split('=', 2).map((i) => i.replace(/\"/g, ''))),
    );
    Object.keys(parsedArgument).forEach((key) => set(Store.Settings, key, parsedArgument[key]));
  } else if (typeof $argument === 'object') {
    Object.keys($argument).forEach((key) => set(Store.Settings, key, $argument[key as keyof typeof $argument]));
  }

  /***************** BoxJs *****************/
  // 包装为局部变量，用完释放内存
  // BoxJs的清空操作返回假值空字符串, 逻辑或操作符会在左侧操作数为假值时返回右侧操作数。
  const BoxJs = Storage.getItem(key);
  if (BoxJs) {
    //Console.debug("BoxJs", `BoxJs类型: ${typeof BoxJs}`, `BoxJs内容: ${JSON.stringify(BoxJs || {})}`);
    nameList.forEach((name) => {
      const boxSettings = BoxJs?.[name]?.Settings;
      const boxCaches = BoxJs?.[name]?.Caches;

      if (typeof boxSettings === 'string') {
        BoxJs[name].Settings = JSON.parse(boxSettings || '{}');
      }
      if (boxSettings) {
        Store.Settings = { ...Store.Settings, ...BoxJs[name].Settings };
      }

      if (typeof boxCaches === 'string') {
        BoxJs[name].Caches = JSON.parse(boxCaches || '{}');
      }
      if (boxCaches) {
        Store.Caches = { ...Store.Caches, ...BoxJs[name].Caches };
      }
    });
  }

  /***************** traverseObject *****************/
  traverseObject(Store.Settings, (key, value) => {
    //Console.debug("☑️ traverseObject", `${key}: ${typeof value}`, `${key}: ${JSON.stringify(value)}`);
    let transformedValue = value;
    if (transformedValue === 'true' || transformedValue === 'false')
      transformedValue = JSON.parse(transformedValue); // 字符串转Boolean
    else if (typeof transformedValue === 'string') {
      if (transformedValue.includes(','))
        transformedValue = transformedValue.split(',').map((item) => string2number(item)); // 字符串转数组转数字
      else transformedValue = string2number(transformedValue); // 字符串转数字
    }
    return transformedValue;
  });

  return Store;
}

/**
 * Recursively traverse and transform object properties.
 */
function traverseObject<T>(obj: Record<string, any>, callback: (key: string, value: any) => any): Record<string, any> {
  Object.entries(obj).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      obj[key] = traverseObject(value, callback);
    } else {
      obj[key] = callback(key, value);
    }
  });
  return obj;
}

/**
 * Convert string to number if applicable.
 */
function string2number(value: string): number | string {
  return /^\d+$/.test(value) ? Number(value) : value;
}
