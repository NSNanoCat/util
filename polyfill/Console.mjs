import { $app } from "../lib/app.mjs";

/**
 * 统一日志工具，兼容各脚本平台、Worker 与 Node.js。
 * Unified logger compatible with script platforms, Worker, and Node.js.
 *
 * logLevel 用法:
 * logLevel usage:
 * - 可读: `Console.logLevel` 返回 `OFF|ERROR|WARN|INFO|DEBUG|ALL`
 * - Read: `Console.logLevel` returns `OFF|ERROR|WARN|INFO|DEBUG|ALL`
 * - 可写: 数字 `0~5` 或字符串 `off/error/warn/info/debug/all`
 * - Write: number `0~5` or string `off/error/warn/info/debug/all`
 *
 * @example
 * Console.logLevel = "debug";
 * Console.debug("only shown when level >= DEBUG");
 * Console.logLevel = 2; // WARN
 */
export class Console {
	static #counts = new Map([]);
	static #groups = [];
	static #times = new Map([]);

	/**
	 * 清空控制台（当前为空实现）。
	 * Clear console (currently a no-op).
	 *
	 * @returns {void}
	 */
	static clear = () => {};

	/**
	 * 增加计数器并打印当前值。
	 * Increment counter and print the current value.
	 *
	 * @param {string} [label="default"] 计数器名称 / Counter label.
	 * @returns {void}
	 */
	static count = (label = "default") => {
		switch (Console.#counts.has(label)) {
			case true:
				Console.#counts.set(label, Console.#counts.get(label) + 1);
				break;
			case false:
				Console.#counts.set(label, 0);
				break;
		}
		Console.log(`${label}: ${Console.#counts.get(label)}`);
	};

	/**
	 * 重置计数器。
	 * Reset a counter.
	 *
	 * @param {string} [label="default"] 计数器名称 / Counter label.
	 * @returns {void}
	 */
	static countReset = (label = "default") => {
		switch (Console.#counts.has(label)) {
			case true:
				Console.#counts.set(label, 0);
				Console.log(`${label}: ${Console.#counts.get(label)}`);
				break;
			case false:
				Console.warn(`Counter "${label}" doesn’t exist`);
				break;
		}
	};

	/**
	 * 输出调试日志。
	 * Print debug logs.
	 *
	 * @param {...any} msg 日志内容 / Log messages.
	 * @returns {void}
	 */
	static debug = (...msg) => {
		if (Console.#level < 4) return;
		msg = msg.map(m => `🅱️ ${m}`);
		Console.log(...msg);
	};

	/**
	 * 输出错误日志。
	 * Print error logs.
	 *
	 * @param {...any} msg 日志内容 / Log messages.
	 * @returns {void}
	 */
	static error(...msg) {
		if (Console.#level < 1) return;
		switch ($app) {
			case "Surge":
			case "Loon":
			case "Stash":
			case "Egern":
			case "Shadowrocket":
			case "Quantumult X":
			default:
				msg = msg.map(m => `❌ ${m}`);
				break;
			case "Worker":
			case "Node.js":
				msg = msg.map(m => `❌ ${m?.stack ?? m}`);
				break;
		}
		Console.log(...msg);
	}

	/**
	 * `error` 的别名。
	 * Alias of `error`.
	 *
	 * @param {...any} msg 日志内容 / Log messages.
	 * @returns {void}
	 */
	static exception = (...msg) => Console.error(...msg);

	/**
	 * 进入日志分组。
	 * Enter a log group.
	 *
	 * @param {string} label 分组名 / Group label.
	 * @returns {number}
	 */
	static group = label => Console.#groups.unshift(label);

	/**
	 * 退出日志分组。
	 * Exit the latest log group.
	 *
	 * @returns {*}
	 */
	static groupEnd = () => Console.#groups.shift();

	/**
	 * 输出信息日志。
	 * Print info logs.
	 *
	 * @param {...any} msg 日志内容 / Log messages.
	 * @returns {void}
	 */
	static info(...msg) {
		if (Console.#level < 3) return;
		msg = msg.map(m => `ℹ️ ${m}`);
		Console.log(...msg);
	}

	static #level = 3;

	/**
	 * 获取日志级别文本。
	 * Get current log level text.
	 *
	 * @returns {"OFF"|"ERROR"|"WARN"|"INFO"|"DEBUG"|"ALL"}
	 */
	static get logLevel() {
		switch (Console.#level) {
			case 0:
				return "OFF";
			case 1:
				return "ERROR";
			case 2:
				return "WARN";
			case 3:
			default:
				return "INFO";
			case 4:
				return "DEBUG";
			case 5:
				return "ALL";
		}
	}

	/**
	 * 设置日志级别。
	 * Set current log level.
	 *
	 * @param {number|string} level 级别值 / Level value.
	 */
	static set logLevel(level) {
		switch (typeof level) {
			case "string":
				level = level.toLowerCase();
				break;
			case "number":
				break;
			case "undefined":
			default:
				level = "warn";
				break;
		}
		switch (level) {
			case 0:
			case "off":
				Console.#level = 0;
				break;
			case 1:
			case "error":
				Console.#level = 1;
				break;
			case 2:
			case "warn":
			case "warning":
			default:
				Console.#level = 2;
				break;
			case 3:
			case "info":
				Console.#level = 3;
				break;
			case 4:
			case "debug":
				Console.#level = 4;
				break;
			case 5:
			case "all":
				Console.#level = 5;
				break;
		}
	}

	/**
	 * 输出通用日志。
	 * Print generic logs.
	 *
	 * @param {...any} msg 日志内容 / Log messages.
	 * @returns {void}
	 */
	static log = (...msg) => {
		if (Console.#level === 0) return;
		msg = msg.map(log => {
			switch (typeof log) {
				case "object":
					log = JSON.stringify(log);
					break;
				case "bigint":
				case "number":
				case "boolean":
				case "string":
					log = log.toString();
					break;
				case "undefined":
				default:
					break;
			}
			return log;
		});
		Console.#groups.forEach(group => {
			msg = msg.map(log => `  ${log}`);
			msg.unshift(`▼ ${group}:`);
		});
		msg = ["", ...msg];
		console.log(msg.join("\n"));
	};

	/**
	 * 开始计时。
	 * Start timer.
	 *
	 * @param {string} [label="default"] 计时器名称 / Timer label.
	 * @returns {Map<string, number>}
	 */
	static time = (label = "default") => Console.#times.set(label, Date.now());

	/**
	 * 结束计时并移除计时器。
	 * End timer and remove it.
	 *
	 * @param {string} [label="default"] 计时器名称 / Timer label.
	 * @returns {boolean}
	 */
	static timeEnd = (label = "default") => Console.#times.delete(label);

	/**
	 * 输出当前计时器耗时。
	 * Print elapsed time for a timer.
	 *
	 * @param {string} [label="default"] 计时器名称 / Timer label.
	 * @returns {void}
	 */
	static timeLog = (label = "default") => {
		const time = Console.#times.get(label);
		if (time) Console.log(`${label}: ${Date.now() - time}ms`);
		else Console.warn(`Timer "${label}" doesn’t exist`);
	};

	/**
	 * 输出警告日志。
	 * Print warning logs.
	 *
	 * @param {...any} msg 日志内容 / Log messages.
	 * @returns {void}
	 */
	static warn(...msg) {
		if (Console.#level < 2) return;
		msg = msg.map(m => `⚠️ ${m}`);
		Console.log(...msg);
	}
}
