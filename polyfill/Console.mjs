import { $platform } from "../lib";

export default class Console {
	static log = (...logs) => console.log(logs.join("\n"));

	static error(msg) {
		switch ($platform) {
			case "Surge":
			case "Loon":
			case "Stash":
			case "Egern":
			case "Shadowrocket":
			case "Quantumult X":
			default:
				Console.log("", "❗️执行错误!", msg, "");
				break;
			case "Node.js":
				Console.log("", "❗️执行错误!", msg.stack, "");
				break;
		}
	}

	static exception = (msg) => Console.error(msg);
}
