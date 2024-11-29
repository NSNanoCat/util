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
		msg = msg.map(m => `🅱️ ${m}`);
		Console.log(...msg);
	};

	static error(...msg) {
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
		msg = msg.map(m => `ℹ️ ${m}`);
		Console.log(...msg);
	}

	static log = (...msg) => {
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
					log = "";
					break;
			}
			return log;
		});
		Console.#groups.forEach(group => {
			msg = msg.map(log => `  ${log}`);
			msg.unshift(`▼ ${group}:`);
		});
		msg = ["", ...msg, ""];
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
		msg = msg.map(m => `⚠️ ${m}`);
		Console.log(...msg);
	}
}
