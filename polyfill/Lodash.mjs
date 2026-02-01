/* https://www.lodashjs.com */
export class Lodash {
	static escape(string) {
		const map = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return string.replace(/[&<>"']/g, m => map[m]);
	}

	static get(object = {}, path = "", defaultValue = undefined) {
		// translate array case to dot case, then split with .
		// a[0].b -> a.0.b -> ['a', '0', 'b']
		if (!Array.isArray(path)) path = Lodash.toPath(path);

		const result = path.reduce((previousValue, currentValue) => {
			return Object(previousValue)[currentValue]; // null undefined get attribute will throwError, Object() can return a object
		}, object);
		return result === undefined ? defaultValue : result;
	}

	/**
	 * 递归合并源对象的自身可枚举属性到目标对象
	 * @description 简化版 lodash.merge，用于合并配置对象
	 *
	 * 适用情况:
	 * - 合并嵌套的配置/设置对象
	 * - 需要深度合并而非浅层覆盖的场景
	 * - 多个源对象依次合并到目标对象
	 *
	 * 限制:
	 * - 仅处理普通对象 (Plain Object)，不处理 Map/Set/Date/RegExp 等特殊对象
	 * - 数组会被直接覆盖，不会合并数组元素
	 * - 不处理循环引用，可能导致栈溢出
	 * - 不复制 Symbol 属性和不可枚举属性
	 * - 不保留原型链，仅处理自身属性
	 * - 会修改原始目标对象 (mutates target)
	 *
	 * @param {object} object - 目标对象
	 * @param {...object} sources - 源对象(可多个)
	 * @returns {object} 返回合并后的目标对象
	 * @example
	 * const target = { a: { b: 1 }, c: 2 };
	 * const source = { a: { d: 3 }, e: 4 };
	 * Lodash.merge(target, source);
	 * // => { a: { b: 1, d: 3 }, c: 2, e: 4 }
	 */
	static merge(object, ...sources) {
		if (object === null || object === undefined) return object;

		for (const source of sources) {
			if (source === null || source === undefined) continue;

			for (const key of Object.keys(source)) {
				const sourceValue = source[key];
				const targetValue = object[key];

				switch (true) {
					case Lodash.#isPlainObject(sourceValue) && Lodash.#isPlainObject(targetValue):
						// 递归合并对象
						object[key] = Lodash.merge(targetValue, sourceValue);
						break;
					case Array.isArray(sourceValue) && sourceValue.length === 0 && targetValue !== undefined:
						// 空数组不覆盖已有值
						break;
					case sourceValue !== undefined:
						object[key] = sourceValue;
						break;
				}
			}
		}

		return object;
	}

	/**
	 * 判断值是否为普通对象 (Plain Object)
	 * @param {*} value - 要检查的值
	 * @returns {boolean} 如果是普通对象返回 true
	 */
	static #isPlainObject(value) {
		if (value === null || typeof value !== "object") return false;
		const proto = Object.getPrototypeOf(value);
		return proto === null || proto === Object.prototype;
	}

	static omit(object = {}, paths = []) {
		if (!Array.isArray(paths)) paths = [paths.toString()];
		paths.forEach(path => Lodash.unset(object, path));
		return object;
	}

	static pick(object = {}, paths = []) {
		if (!Array.isArray(paths)) paths = [paths.toString()];
		const filteredEntries = Object.entries(object).filter(([key, value]) => paths.includes(key));
		return Object.fromEntries(filteredEntries);
	}

	static set(object, path, value) {
		if (!Array.isArray(path)) path = Lodash.toPath(path);
		path.slice(0, -1).reduce((previousValue, currentValue, currentIndex) => (Object(previousValue[currentValue]) === previousValue[currentValue] ? previousValue[currentValue] : (previousValue[currentValue] = /^\d+$/.test(path[currentIndex + 1]) ? [] : {})), object)[path[path.length - 1]] = value;
		return object;
	}

	static toPath(value) {
		return value
			.replace(/\[(\d+)\]/g, ".$1")
			.split(".")
			.filter(Boolean);
	}

	static unescape(string) {
		const map = {
			"&amp;": "&",
			"&lt;": "<",
			"&gt;": ">",
			"&quot;": '"',
			"&#39;": "'",
		};
		return string.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, m => map[m]);
	}

	static unset(object = {}, path = "") {
		if (!Array.isArray(path)) path = Lodash.toPath(path);
		const result = path.reduce((previousValue, currentValue, currentIndex) => {
			if (currentIndex === path.length - 1) {
				delete previousValue[currentValue];
				return true;
			}
			return Object(previousValue)[currentValue];
		}, object);
		return result;
	}
}
