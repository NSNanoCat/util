/**
 * 跨平台控制台输出适配器。
 * Cross-platform console output adapter.
 */
export class Console {
	/**
	 * 清空控制台输出。
	 * Clear the console output.
	 */
	static clear(): void;

	/**
	 * 增加指定标签的计数。
	 * Increment the counter for the given label.
	 *
	 * @param label 计数标签 / Counter label.
	 */
	static count(label?: string): void;

	/**
	 * 重置指定标签的计数。
	 * Reset the counter for the given label.
	 *
	 * @param label 计数标签 / Counter label.
	 */
	static countReset(label?: string): void;

	/**
	 * 输出调试级别日志。
	 * Print debug-level log messages.
	 *
	 * @param msg 日志内容 / Log payloads.
	 */
	static debug(...msg: unknown[]): void;

	/**
	 * 输出错误级别日志。
	 * Print error-level log messages.
	 *
	 * @param msg 日志内容 / Log payloads.
	 */
	static error(...msg: unknown[]): void;

	/**
	 * 输出异常级别日志。
	 * Print exception-level log messages.
	 *
	 * @param msg 日志内容 / Log payloads.
	 */
	static exception(...msg: unknown[]): void;

	/**
	 * 开始一个日志分组。
	 * Start a log group.
	 *
	 * @param label 分组标签 / Group label.
	 * @returns 当前分组深度 / Current group depth.
	 */
	static group(label: string): number;

	/**
	 * 结束当前日志分组。
	 * End the current log group.
	 *
	 * @returns 已结束的分组标签 / Closed group label.
	 */
	static groupEnd(): string | undefined;

	/**
	 * 输出信息级别日志。
	 * Print info-level log messages.
	 *
	 * @param msg 日志内容 / Log payloads.
	 */
	static info(...msg: unknown[]): void;

	/**
	 * 获取当前日志级别。
	 * Get the current log level.
	 */
	static get logLevel(): "OFF" | "ERROR" | "WARN" | "INFO" | "DEBUG" | "ALL";

	/**
	 * 设置日志级别。
	 * Set the current log level.
	 *
	 * @param level 日志级别 / Log level.
	 */
	static set logLevel(level: number | string);

	/**
	 * 输出普通日志。
	 * Print standard log messages.
	 *
	 * @param msg 日志内容 / Log payloads.
	 */
	static log(...msg: unknown[]): void;

	/**
	 * 启动计时器。
	 * Start a timer.
	 *
	 * @param label 计时器标签 / Timer label.
	 * @returns 计时器映射表 / Timer map.
	 */
	static time(label?: string): Map<string, number>;

	/**
	 * 结束计时器并返回是否成功结束。
	 * End a timer and return whether it was closed.
	 *
	 * @param label 计时器标签 / Timer label.
	 * @returns 是否成功结束 / Whether the timer was closed.
	 */
	static timeEnd(label?: string): boolean;

	/**
	 * 输出计时器当前耗时。
	 * Print current elapsed time for a timer.
	 *
	 * @param label 计时器标签 / Timer label.
	 */
	static timeLog(label?: string): void;

	/**
	 * 输出警告级别日志。
	 * Print warn-level log messages.
	 *
	 * @param msg 日志内容 / Log payloads.
	 */
	static warn(...msg: unknown[]): void;
}
