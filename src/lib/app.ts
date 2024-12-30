/**
 * Current app name
 */
export const $app = (() => {
	if ("$task" in globalThis) {
		return "Quantumult X";
	}
	if ("$loon" in globalThis) {
		return "Loon";
	}
	if ("$rocket" in globalThis) {
		return "Shadowrocket";
	}
	if ("Egern" in globalThis) {
		return "Egern";
	}
	if ("$environment" in globalThis) {
		if (globalThis.$environment["surge-version"]) {
			return "Surge";
		}
		if (globalThis.$environment["stash-version"]) {
			return "Stash";
		}
	}
	if (typeof module !== "undefined") {
		return "Node.js";
	}
})();
