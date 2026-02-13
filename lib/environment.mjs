import { $app } from "./app.mjs";

/**
 * 标准化后的运行环境对象。
 * Normalized runtime environment object.
 *
 * - Surge/Stash/Egern: 基于全局 `$environment` 并补充 `app`
 * - Surge/Stash/Egern: based on global `$environment` with `app` patched
 * - Loon: 解析 `$loon` 得到设备与版本信息
 * - Loon: parse `$loon` into device/version fields
 * - Quantumult X: 仅返回 `{ app: "Quantumult X" }`
 * - Quantumult X: returns `{ app: "Quantumult X" }` only
 * - Node.js: 复用 `process.env` 并写入 `process.env.app`
 * - Node.js: reuses `process.env` and writes `process.env.app`
 *
 * @type {Record<string, any>}
 */
export const $environment = environment();

/**
 * 获取标准化环境对象。
 * Build and return the normalized environment object.
 *
 * @returns {Record<string, any>}
 */
export function environment() {
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
			process.env.app = "Node.js";
			return process.env;
		default:
			return {};
	}
}
