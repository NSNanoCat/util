import { $app } from "../lib/app.mjs";

export class Console {
	static #counts = new Map([]);
	static #groups = [];
	static #times = new Map([]);

	static clear = () => {};

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

	static debug = (...msg) => {
		if (Console.#level < 4) return;
		msg = msg.map(m => `🅱️ ${m}`);
		Console.log(...msg);
	};

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
			case "Node.js":
				msg = msg.map(m => `❌ ${m.stack}`);
				break;
		}
		Console.log(...msg);
	}

	static exception = (...msg) => Console.error(...msg);

	static group = label => Console.#groups.unshift(label);

	static groupEnd = () => Console.#groups.shift();

	static info(...msg) {
		if (Console.#level < 3) return;
		msg = msg.map(m => `ℹ️ ${m}`);
		Console.log(...msg);
	}

	static #level = 3;

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

	static time = (label = "default") => Console.#times.set(label, Date.now());

	static timeEnd = (label = "default") => Console.#times.delete(label);

	static timeLog = (label = "default") => {
		const time = Console.#times.get(label);
		if (time) Console.log(`${label}: ${Date.now() - time}ms`);
		else Console.warn(`Timer "${label}" doesn’t exist`);
	};

	static warn(...msg) {
		if (Console.#level < 2) return;
		msg = msg.map(m => `⚠️ ${m}`);
		Console.log(...msg);
	}
}
