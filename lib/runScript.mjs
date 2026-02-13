import { Console } from "../polyfill/Console.mjs";
import { fetch } from "../polyfill/fetch.mjs";
import { Lodash as _ } from "../polyfill/Lodash.mjs";
import { Storage } from "../polyfill/Storage.mjs";

/**
 * 远程脚本执行选项。
 * Remote script execution options.
 *
 * @typedef {object} RunScriptOptions
 * @property {number} [timeout] 执行超时秒数 / Timeout in seconds.
 */

/**
 * 通过 BoxJS HTTP API 触发脚本执行。
 * Trigger script execution through BoxJS HTTP API.
 *
 * 依赖键:
 * Required keys:
 * - `@chavy_boxjs_userCfgs.httpapi` (`password@host:port`)
 * - `@chavy_boxjs_userCfgs.httpapi_timeout`
 *
 * @param {string} script 脚本文本 / Script source text.
 * @param {RunScriptOptions} [runOpts] 运行选项 / Runtime options.
 * @returns {Promise<void>}
 */
export async function runScript(script, runOpts) {
	let httpapi = Storage.getItem("@chavy_boxjs_userCfgs.httpapi");
	httpapi = httpapi?.replace?.(/\n/g, "")?.trim();
	let httpapi_timeout = Storage.getItem("@chavy_boxjs_userCfgs.httpapi_timeout");
	httpapi_timeout = httpapi_timeout * 1 ?? 20;
	httpapi_timeout = runOpts?.timeout ?? httpapi_timeout;
	const [password, address] = httpapi.split("@");
	const request = {
		url: `http://${address}/v1/scripting/evaluate`,
		body: {
			script_text: script,
			mock_type: "cron",
			timeout: httpapi_timeout,
		},
		headers: { "X-Key": password, Accept: "*/*" },
		timeout: httpapi_timeout,
	};
	await fetch(request).then(
		response => response.body,
		error => Console.error(error),
	);
}
