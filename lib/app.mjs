/**
 * Current app name
 *
 * @type {("Quantumult X" | "Loon" | "Shadowrocket" | "Node.js" | "Egern" | "Surge" | "Stash")}
 */
export const $app = (() => {
	const keys = Object.keys(globalThis);
	switch (true) {
		case keys.includes("$task"):
			return "Quantumult X";
		case keys.includes("$loon"):
			return "Loon";
		case keys.includes("$rocket"):
			return "Shadowrocket";
		case keys.includes("module"):
			return "Node.js";
		case keys.includes("Egern"):
			return "Egern";
		case keys.includes("$environment"):
			if ($environment["surge-version"]) return "Surge";
			if ($environment["stash-version"]) return "Stash";
			return undefined;
		default:
			return undefined;
	}
})();
