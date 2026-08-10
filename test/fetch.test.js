import assert from "node:assert";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { describe, it } from "node:test";
import { promisify } from "node:util";
import { fetch as fetchEsm } from "../index.mjs";

const require = createRequire(import.meta.url);
const { fetch: fetchCjs } = require("../index.cjs");
const executeFile = promisify(execFile);

describe("fetch", () => {
	it("应该在 Node.js 中捕获 ESM 路径的运行时错误", async () => {
		await assert.rejects(
			() =>
				fetchEsm("https://httpbin.org/get", {
					headers: {
						Accept: "application/json",
					},
					timeout: 10,
				}),
			error => {
				assert.ok(error instanceof Error);
				assert.match(error.message, /require is not defined/);
				return true;
			},
		);
	});

	it("应该在 Node.js 中通过 CJS 路径保留 CookieJar", async () => {
		const fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch");
		try {
			Reflect.defineProperty(globalThis, "fetch", {
				value: async () => new Response("cjs", { status: 200 }),
				configurable: true,
				enumerable: true,
				writable: true,
			});

			const response = await fetchCjs("https://unit.test/cjs", {
				"auto-cookie": true,
				timeout: 1,
			});

			assert.strictEqual(response.ok, true);
			assert.strictEqual(response.status, 200);
			assert.strictEqual(response.body, "cjs");
			assert.ok(globalThis.fetch.cookieJar);
		} finally {
			if (fetchDescriptor) Reflect.defineProperty(globalThis, "fetch", fetchDescriptor);
			else Reflect.deleteProperty(globalThis, "fetch");
		}
	});

	it("未识别宿主但具备标准 Fetch API 时应回落到宿主 Fetch", async () => {
		const moduleURL = new URL("../index.mjs", import.meta.url);
		const script = `
			Reflect.deleteProperty(globalThis, "self");
			Reflect.deleteProperty(globalThis, "window");
			Reflect.deleteProperty(globalThis, "process");
			Object.defineProperty(globalThis, "$httpClient", {
				configurable: true,
				get() {
					throw new Error("不应访问 $httpClient");
				},
			});
			let invocation;
			globalThis.fetch = async (url, options) => {
				invocation = {
					url,
					method: options.method,
					redirect: options.redirect,
					bodyIsArrayBuffer: options.body instanceof ArrayBuffer,
					hasTimeout: "timeout" in options,
					hasPolicy: "policy" in options,
				};
				return new Response("fallback", { status: 200 });
			};
			const { $app, fetch } = await import(${JSON.stringify(moduleURL.href)});
			const response = await fetch({
				url: "https://unit.test/fallback",
				method: "POST",
				bodyBytes: new Uint8Array([1, 2, 3]).buffer,
				timeout: 1,
				policy: "Proxy",
				redirection: true,
				"auto-cookie": true,
			});
			console.log(JSON.stringify({ app: $app ?? null, invocation, status: response.status, body: response.body }));
		`;
		const { stdout } = await executeFile(process.execPath, ["--input-type=module", "--eval", script]);

		assert.deepStrictEqual(JSON.parse(stdout), {
			app: null,
			invocation: {
				url: "https://unit.test/fallback",
				method: "POST",
				redirect: "follow",
				bodyIsArrayBuffer: true,
				hasTimeout: false,
				hasPolicy: false,
			},
			status: 200,
			body: "fallback",
		});
	});

	it("未识别宿主且缺少标准 Fetch API 时应抛出明确错误", async () => {
		const moduleURL = new URL("../index.mjs", import.meta.url);
		const script = `
			Reflect.deleteProperty(globalThis, "self");
			Reflect.deleteProperty(globalThis, "window");
			Reflect.deleteProperty(globalThis, "process");
			Reflect.deleteProperty(globalThis, "fetch");
			Reflect.deleteProperty(globalThis, "Headers");
			Reflect.deleteProperty(globalThis, "Request");
			Reflect.deleteProperty(globalThis, "Response");
			const { fetch } = await import(${JSON.stringify(moduleURL.href)});
			try {
				await fetch("https://unit.test/unsupported");
			} catch (error) {
				console.log(error.message);
			}
		`;
		const { stdout } = await executeFile(process.execPath, ["--input-type=module", "--eval", script]);

		assert.match(stdout.trim(), /当前运行环境不支持 Fetch API/);
	});
});
