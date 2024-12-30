import { $app } from "./app";

interface Environment extends globalThis.Environment {
	app?: string;
	device?: string;
	ios?: string;
	[key: string]: string | undefined;
}

declare const $loon: string;
declare const $environment: Environment;

export function environment(): Environment {
	switch ($app) {
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
			return {
				...process.env,
				app: "Node.js",
			};
		default:
			return {};
	}
}

// export const $environment = environment();
