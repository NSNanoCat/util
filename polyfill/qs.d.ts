/**
 * 查询字符串解析与序列化工具。
 * Query string parser and serializer.
 */
export class qs {
	/**
	 * 将查询字符串或对象解析为规范对象。
	 * Parse a query string or object into a normalized object.
	 *
	 * @param query 查询输入 / Query input.
	 * @returns 解析结果对象 / Parsed object.
	 */
	static parse(query?: string | Record<string, unknown> | null): Record<string, unknown>;

	/**
	 * 将对象序列化为查询字符串。
	 * Serialize an object into a query string.
	 *
	 * @param object 输入对象 / Input object.
	 * @returns 序列化后的查询字符串 / Serialized query string.
	 */
	static stringify(object?: Record<string, unknown>): string;
}
