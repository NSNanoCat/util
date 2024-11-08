export const $app = (() => {
	const keys = Object.keys(this);
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
		// biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
		case keys.includes("$environment"):
			if ($environment["surge-version"]) return "Surge";
			if ($environment["stash-version"]) return "Stash";
		default:
			return undefined;
	}
})();
