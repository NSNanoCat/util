/* https://www.lodashjs.com */
/**
 * 轻量 Lodash 工具集。
 * Lightweight Lodash-like utilities.
 *
 * 说明:
 * Notes:
 * - 这是 Lodash 的“部分方法”简化实现，不等价于完整 Lodash
 * - This is a simplified subset, not a full Lodash implementation
 * - 各方法语义可参考 Lodash 官方文档
 * - Method semantics can be referenced from official Lodash docs
 * - 导入时建议使用 `Lodash as _`，遵循 lodash 官方示例惯例
 * - Use `Lodash as _` when importing, following official lodash example convention
 *
 * 参考:
 * Reference:
 * - https://www.lodashjs.com
 * - https://lodash.com
 */
export class Lodash {
	/**
	 * HTML 特殊字符转义。
	 * Escape HTML special characters.
	 *
	 * @param {string} string 输入文本 / Input text.
	 * @returns {string}
	 * @see {@link https://lodash.com/docs/#escape lodash.escape}
	 * @see {@link https://www.lodashjs.com/docs/lodash.escape lodash.escape (中文)}
	 */
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

	/**
	 * 按路径读取对象值。
	 * Get object value by path.
	 *
	 * @param {object} [object={}] 目标对象 / Target object.
	 * @param {string|string[]} [path=""] 路径 / Path.
	 * @param {*} [defaultValue=undefined] 默认值 / Default value.
	 * @returns {*}
	 * @see {@link https://lodash.com/docs/#get lodash.get}
	 * @see {@link https://www.lodashjs.com/docs/lodash.get lodash.get (中文)}
	 */
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
	 * Recursively merge source enumerable properties into target object.
	 * @description 简化版 lodash.merge，用于合并配置对象
	 * @description A simplified lodash.merge for config merging.
	 *
	 * 适用情况:
	 * - 合并嵌套的配置/设置对象
	 * - 需要深度合并而非浅层覆盖的场景
	 * - 多个源对象依次合并到目标对象
	 *
	 * 限制:
	 * - 仅处理普通对象 (Plain Object)，不处理 Date/RegExp 等特殊对象
	 * - Map/Set 仅支持同类型合并，不递归内部值
	 * - 数组会被直接覆盖，不会合并数组元素
	 * - 不处理循环引用，可能导致栈溢出
	 * - 不复制 Symbol 属性和不可枚举属性
	 * - 不保留原型链，仅处理自身属性
	 * - 会修改原始目标对象 (mutates target)
	 *
	 * @param {object} object - 目标对象
	 * @param {object} object - Target object.
	 * @param {...object} sources - 源对象(可多个)
	 * @param {...object} sources - Source objects.
	 * @returns {object} 返回合并后的目标对象
	 * @returns {object} Merged target object.
	 * @see {@link https://lodash.com/docs/#merge lodash.merge}
	 * @see {@link https://www.lodashjs.com/docs/lodash.merge lodash.merge (中文)}
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
					case sourceValue instanceof Map && targetValue instanceof Map:
						// 合并 Map（空 Map 跳过）
						if (sourceValue.size > 0) {
							for (const [k, v] of sourceValue) {
								targetValue.set(k, v);
							}
						}
						break;
					case sourceValue instanceof Set && targetValue instanceof Set:
						// 合并 Set（空 Set 跳过）
						if (sourceValue.size > 0) {
							for (const v of sourceValue) {
								targetValue.add(v);
							}
						}
						break;
					case Array.isArray(sourceValue) && sourceValue.length === 0 && targetValue !== undefined:
						// 空数组不覆盖已有值
						break;
					case (sourceValue instanceof Map && sourceValue.size === 0 && targetValue !== undefined):
					case (sourceValue instanceof Set && sourceValue.size === 0 && targetValue !== undefined):
						// 空 Map/Set 不覆盖已有值
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
	 * Check whether a value is a plain object.
	 * @param {*} value - 要检查的值
	 * @param {*} value - Value to check.
	 * @returns {boolean} 如果是普通对象返回 true
	 * @returns {boolean} Returns true when value is a plain object.
	 * @see {@link https://lodash.com/docs/#isPlainObject lodash.isPlainObject}
	 * @see {@link https://www.lodashjs.com/docs/lodash.isPlainObject lodash.isPlainObject (中文)}
	 */
	static #isPlainObject(value) {
		if (value === null || typeof value !== "object") return false;
		const proto = Object.getPrototypeOf(value);
		return proto === null || proto === Object.prototype;
	}

	/**
	 * 删除对象指定路径并返回对象。
	 * Omit paths from object and return the same object.
	 *
	 * @param {object} [object={}] 目标对象 / Target object.
	 * @param {string|string[]} [paths=[]] 要删除的路径 / Paths to remove.
	 * @returns {object}
	 * @see {@link https://lodash.com/docs/#omit lodash.omit}
	 * @see {@link https://www.lodashjs.com/docs/lodash.omit lodash.omit (中文)}
	 */
	static omit(object = {}, paths = []) {
		if (!Array.isArray(paths)) paths = [paths.toString()];
		paths.forEach(path => Lodash.unset(object, path));
		return object;
	}

	/**
	 * 仅保留对象指定键（第一层）。
	 * Pick selected keys from object (top level only).
	 *
	 * @param {object} [object={}] 目标对象 / Target object.
	 * @param {string|string[]} [paths=[]] 需要保留的键 / Keys to keep.
	 * @returns {object}
	 * @see {@link https://lodash.com/docs/#pick lodash.pick}
	 * @see {@link https://www.lodashjs.com/docs/lodash.pick lodash.pick (中文)}
	 */
	static pick(object = {}, paths = []) {
		if (!Array.isArray(paths)) paths = [paths.toString()];
		const filteredEntries = Object.entries(object).filter(([key, value]) => paths.includes(key));
		return Object.fromEntries(filteredEntries);
	}

	/**
	 * 按路径写入对象值。
	 * Set object value by path.
	 *
	 * @param {object} object 目标对象 / Target object.
	 * @param {string|string[]} path 路径 / Path.
	 * @param {*} value 写入值 / Value.
	 * @returns {object}
	 * @see {@link https://lodash.com/docs/#set lodash.set}
	 * @see {@link https://www.lodashjs.com/docs/lodash.set lodash.set (中文)}
	 */
	static set(object, path, value) {
		if (!Array.isArray(path)) path = Lodash.toPath(path);
		path.slice(0, -1).reduce((previousValue, currentValue, currentIndex) => (Object(previousValue[currentValue]) === previousValue[currentValue] ? previousValue[currentValue] : (previousValue[currentValue] = /^\d+$/.test(path[currentIndex + 1]) ? [] : {})), object)[path[path.length - 1]] = value;
		return object;
	}

	/**
	 * 将点路径或数组下标路径转换为数组。
	 * Convert dot/array-index path string into path segments.
	 *
	 * @param {string} value 路径字符串 / Path string.
	 * @returns {string[]}
	 * @see {@link https://lodash.com/docs/#toPath lodash.toPath}
	 * @see {@link https://www.lodashjs.com/docs/lodash.toPath lodash.toPath (中文)}
	 */
	static toPath(value) {
		return value
			.replace(/\[(\d+)\]/g, ".$1")
			.split(".")
			.filter(Boolean);
	}

	/**
	 * HTML 实体反转义。
	 * Unescape HTML entities.
	 *
	 * @param {string} string 输入文本 / Input text.
	 * @returns {string}
	 * @see {@link https://lodash.com/docs/#unescape lodash.unescape}
	 * @see {@link https://www.lodashjs.com/docs/lodash.unescape lodash.unescape (中文)}
	 */
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

	/**
	 * 删除对象路径对应的值。
	 * Remove value by object path.
	 *
	 * @param {object} [object={}] 目标对象 / Target object.
	 * @param {string|string[]} [path=""] 路径 / Path.
	 * @returns {boolean}
	 * @see {@link https://lodash.com/docs/#unset lodash.unset}
	 * @see {@link https://www.lodashjs.com/docs/lodash.unset lodash.unset (中文)}
	 */
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
