/**
 * 当前运行平台名称（脚本平台优先，模块系统次之）。
 * Current runtime platform name (script platform first, module system second).
 *
 * 识别顺序:
 * Detection order:
 * 1) `$task` -> Quantumult X
 * 2) `$loon` -> Loon
 * 3) `$rocket` -> Shadowrocket
 * 4) `Egern` -> Egern
 * 5) `$environment["surge-version"]` -> Surge
 * 6) `$environment["stash-version"]` -> Stash
 * 7) `Cloudflare` -> Worker
 * 8) `process.versions.node` -> Node.js
 * 9) 默认回落 -> undefined
 *    default fallback -> undefined
 *
 * 说明:
 * Notes:
 * - 使用 `'key' in globalThis`，避免 `Object.keys` 对不可枚举全局变量漏检。
 * - Use `'key' in globalThis` to avoid missing non-enumerable globals with `Object.keys`.
 *
 * @type {("Quantumult X" | "Loon" | "Shadowrocket" | "Egern" | "Surge" | "Stash" | "Worker" | "Node.js" | undefined)}
 */
export const $app = (() => {
	const has = key => key in globalThis;
	switch (true) {
		case has("$task"):
			return "Quantumult X";
		case has("$loon"):
			return "Loon";
		case has("$rocket"):
			return "Shadowrocket";
		case has("Egern"):
			return "Egern";
		case Boolean(globalThis.$environment?.["surge-version"]):
			return "Surge";
		case Boolean(globalThis.$environment?.["stash-version"]):
			return "Stash";
		case has("Cloudflare"):
			//case has("ServiceWorkerGlobalScope") && has("self") && has("caches") && has("scheduler"):
			return "Worker";
		case Boolean(globalThis.process?.versions?.node):
			return "Node.js";
		default:
			return undefined;
	}
})();
