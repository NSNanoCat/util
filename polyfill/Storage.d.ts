/**
 * 跨平台持久化存储适配器。
 * Cross-platform persistent storage adapter.
 */
export class Storage {
	/**
	 * 运行时缓存的数据对象。
	 * Runtime cached data object.
	 */
	static data: Record<string, unknown> | null;

	/**
	 * Node.js 分支持久化文件名。
	 * Persistent filename for Node.js branch.
	 */
	static dataFile: string;

	/**
	 * 读取指定键值。
	 * Read a value by key.
	 *
	 * @param keyName 键名 / Key name.
	 * @param defaultValue 默认值 / Default value.
	 * @returns 读取结果 / Read value.
	 */
	static getItem<T = unknown>(keyName: string, defaultValue?: T): T;

	/**
	 * 写入指定键值。
	 * Write a value by key.
	 *
	 * @param keyName 键名 / Key name.
	 * @param keyValue 写入值 / Value to write.
	 * @returns 是否写入成功 / Whether write succeeded.
	 */
	static setItem(keyName: string, keyValue: unknown): boolean;

	/**
	 * 删除指定键。
	 * Remove a value by key.
	 *
	 * @param keyName 键名 / Key name.
	 * @returns 是否删除成功 / Whether removal succeeded.
	 */
	static removeItem(keyName: string): boolean;

	/**
	 * 清空存储。
	 * Clear the storage.
	 *
	 * @returns 是否清空成功 / Whether clear succeeded.
	 */
	static clear(): boolean;
}
