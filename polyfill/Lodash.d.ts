/**
 * 轻量 Lodash 风格工具集。
 * Lightweight Lodash-style utility helpers.
 */
export class Lodash {
	/**
	 * 对 HTML 字符进行转义。
	 * Escape HTML characters.
	 *
	 * @param string 输入字符串 / Input string.
	 * @returns 转义后的字符串 / Escaped string.
	 */
	static escape(string: string): string;

	/**
	 * 读取对象中的嵌套路径值。
	 * Read a nested value from an object path.
	 *
	 * @param object 目标对象 / Target object.
	 * @param path 路径表达式 / Path expression.
	 * @param defaultValue 默认值 / Default value.
	 * @returns 路径值或默认值 / Path value or default.
	 */
	static get<T = unknown, D = undefined>(object?: Record<string, unknown>, path?: string | string[], defaultValue?: D): T | D;

	/**
	 * 深度合并对象。
	 * Deep-merge objects.
	 *
	 * @param object 目标对象 / Target object.
	 * @param sources 源对象列表 / Source objects.
	 * @returns 合并后的目标对象 / Merged target object.
	 */
	static merge<T extends Record<string, unknown>>(object: T, ...sources: Array<Record<string, unknown> | null | undefined>): T;

	/**
	 * 返回排除指定路径后的对象副本。
	 * Return a copy without specific paths.
	 *
	 * @param object 目标对象 / Target object.
	 * @param paths 排除路径 / Paths to omit.
	 * @returns 排除后的对象 / Object without omitted paths.
	 */
	static omit<T extends Record<string, unknown>>(object?: T, paths?: string | string[]): T;

	/**
	 * 返回仅包含指定路径的对象副本。
	 * Return a copy with only selected paths.
	 *
	 * @param object 目标对象 / Target object.
	 * @param paths 选择路径 / Paths to pick.
	 * @returns 仅保留指定路径的对象 / Object containing picked paths.
	 */
	static pick<T extends Record<string, unknown>, K extends keyof T>(object?: T, paths?: K | K[]): Pick<T, K>;

	/**
	 * 写入对象中的嵌套路径值。
	 * Set a nested value by path.
	 *
	 * @param object 目标对象 / Target object.
	 * @param path 路径表达式 / Path expression.
	 * @param value 写入值 / Value to set.
	 * @returns 修改后的目标对象 / Mutated target object.
	 */
	static set<T extends Record<string, unknown>>(object: T, path: string | string[], value: unknown): T;

	/**
	 * 将路径字符串转换为路径数组。
	 * Convert a path string to path segments.
	 *
	 * @param value 路径字符串 / Path string.
	 * @returns 路径数组 / Path segments.
	 */
	static toPath(value: string): string[];

	/**
	 * 还原 HTML 转义字符。
	 * Unescape HTML entities.
	 *
	 * @param string 输入字符串 / Input string.
	 * @returns 还原后的字符串 / Unescaped string.
	 */
	static unescape(string: string): string;

	/**
	 * 删除对象中的嵌套路径值。
	 * Delete a nested value by path.
	 *
	 * @param object 目标对象 / Target object.
	 * @param path 路径表达式 / Path expression.
	 * @returns 是否删除成功 / Whether deletion succeeded.
	 */
	static unset(object?: Record<string, unknown>, path?: string | string[]): boolean;
}
