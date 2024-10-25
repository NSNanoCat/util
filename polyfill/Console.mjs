import { $app } from "../lib/app.mjs";

export default class Console {
	static #counts = new Map([]);
	static #groups = [];
	static #times = new Map([]);

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
				Console.count(label);
				break;
			case false:
				Console.warn(`Counter "${label}" doesn’t exist`);
				break;
		}
	};

	static debug = (...logs) => {
		msg = msg.map(m => `🐛 ${m}`);
		Console.log("", ...msg, "");
	};

	static group = label => Console.#groups.unshift(label);

	static groupEnd = () => Console.#groups.shift();

	static info(...msg) {
		msg = msg.map(m => `ℹ️ ${m}`);
		Console.log("", msg, "");
	}

	static log = (...logs) => {
		logs = logs.map(log => {
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
			logs.unshift(`▼ ${group}:`);
			logs = logs.map(log => `  ${log}`);
		});
		console.log(logs.join("\n"));
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
		Console.log("", ...msg, "");
	}

	static exception = (...msg) => Console.error(...msg);

	static warn(...msg) {
		msg = msg.map(m => `⚠️ ${m}`);
		Console.log("", ...msg, "");
	}
}
