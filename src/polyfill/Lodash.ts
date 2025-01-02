import type { ToPath } from 'type-fest/source/get';
import type { Get, Paths, PickDeep } from 'type-fest';

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
} as const;

const UNESCAPE_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
} as const;

const ESCAPE_REGEX = /[&<>"']/g;
const UNESCAPE_REGEX = /&(amp|lt|gt|quot|#39);/g;

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export const escape = (str: string) => {
  if (!ESCAPE_REGEX.test(str)) return str;

  ESCAPE_REGEX.lastIndex = 0;
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_MAP[match as keyof typeof ESCAPE_MAP]);
};

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export const unescape = (str: string) => {
  if (!UNESCAPE_REGEX.test(str)) return str;

  UNESCAPE_REGEX.lastIndex = 0;
  return str.replace(UNESCAPE_REGEX, (match) => UNESCAPE_MAP[match as keyof typeof UNESCAPE_MAP]);
};

export const toPath = <T extends string>(value: T) =>
  value
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean) as ToPath<T>;

export const get = <T, Path extends string>(obj: T, path: Path, defaultValue?: Get<T, Path>) => {
  const getPath = Array.isArray(path) ? path : toPath(path);
  const result = getPath.reduce((previousValue, currentValue) => Object(previousValue)[currentValue], obj);
  return result === undefined ? defaultValue : result;
};

export const set = <T, Path extends string>(obj: T, path: Path, value: Get<T, Path>) => {
  const setPath = (Array.isArray(path) ? path : toPath(path)) as string[];

  setPath.slice(0, -1).reduce((prev, key, index) => {
    if (typeof prev[key] !== 'object' || prev[key] === null) {
      prev[key] = /^\d+$/.test(setPath[index + 1]) ? [] : {};
    }
    return prev[key];
  }, obj as Record<string, any>)[setPath[setPath.length - 1]] = value;

  return obj;
};

export const unset = <T, Path extends string>(obj: T, path: Path) => {
  const unsetPath = Array.isArray(path) ? path : toPath(path);
  return unsetPath.reduce((previousValue, currentValue, currentIndex) => {
    if (currentIndex === path.length - 1) {
      delete previousValue[currentValue as Path];
      return true;
    }
    return Object(previousValue)[currentValue];
  }, obj);
}

export const omit = <T extends object, PathArray extends Array<Paths<T> & string>>(obj: T, paths: PathArray) => {
  const result = { ...obj };
  paths.forEach((path) => unset(result, path));
  return result as Omit<T, PathArray[number]>;
};

export const pick = <T extends object, PathArray extends Array<Paths<T> & string>>(obj: T, paths: PathArray) => {
  return Object.entries(obj)
    .filter(([key]) => paths.includes(key as PathArray[number]))
    .reduce(
      (result, [key, value]) => {
        (result as any)[key] = value;
        return result;
      },
      {} as PickDeep<T, PathArray[number]>
    );
}

export const Lodash = {
  escape,
  unescape,
  toPath,
  get,
  set,
  unset,
  omit,
  pick,
}