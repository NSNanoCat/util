import { $platform } from "./index.js";

export const $environment = environment();
export function environment() {
	switch ($platform) {
		case "Surge":
			$environment.app = "Surge";
			return $environment;
		case "Stash":
			$environment.app = "Stash";
			return $environment;
		case "Egern":
			$environment.app = "Egern";
			return $environment;
		case "Loon": {
			const environment = $loon.split(" ");
			return {
				device: environment[0],
				ios: environment[1],
				"loon-version": environment[2],
				app: "Loon",
			};
		}
		case "Quantumult X":
			return {
				app: "Quantumult X",
			};
		case "Node.js":
			process.env.app = "Node.js";
			return process.env;
		default:
			return {};
	}
}
