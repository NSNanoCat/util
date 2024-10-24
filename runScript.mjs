import { _, Storage, fetch, logError } from "./utils.mjs";

export default async function runScript(script, runOpts) {
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
		error => logError(error),
	);
}
