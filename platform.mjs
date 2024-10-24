export const $platform = platform();
export function platform() {
	if ("undefined" !== typeof $environment && $environment["surge-version"]) return "Surge";
	if ("undefined" !== typeof $environment && $environment["stash-version"]) return "Stash";
	if ("undefined" !== typeof module && !!module.exports) return "Node.js";
	if ("undefined" !== typeof $task) return "Quantumult X";
	if ("undefined" !== typeof $loon) return "Loon";
	if ("undefined" !== typeof $rocket) return "Shadowrocket";
	if ("undefined" !== typeof Egern) return "Egern";
}
