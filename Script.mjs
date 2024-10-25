import { Storage, fetch, logError } from ".";

export default class Script {
	async get(url) {
		return await fetch(url).then(response => response.body);
	}

	async run(script, options) {
		let httpapi = Storage.getItem("@chavy_boxjs_userCfgs.httpapi");
		httpapi = httpapi?.replace?.(/\n/g, "")?.trim();
		let httpapi_timeout = Storage.getItem("@chavy_boxjs_userCfgs.httpapi_timeout");
		httpapi_timeout = httpapi_timeout * 1 ?? 20;
		httpapi_timeout = options?.timeout ?? httpapi_timeout;
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
		return await fetch(request).then(
			response => response.body,
			error => logError(error),
		);
	}
}
