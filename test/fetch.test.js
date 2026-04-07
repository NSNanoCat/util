import assert from "node:assert";
import { createRequire } from "node:module";
import { describe, it } from "node:test";
import { fetch as fetchEsm } from "../index.js";

const require = createRequire(import.meta.url);
const { fetch: fetchCjs } = require("../index.cjs");

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

	it("应该在 Node.js 中通过 CJS 路径成功请求 httpbin", async () => {
		const response = await fetchCjs("https://httpbin.org/get", {
			headers: {
				Accept: "application/json",
			},
			"auto-cookie": true,
			timeout: 10,
		});

		assert.strictEqual(response.ok, true);
		assert.strictEqual(response.status, 200);
		assert.strictEqual(typeof response.body, "string");

		const payload = JSON.parse(response.body);
		assert.strictEqual(payload.url, "https://httpbin.org/get");
		assert.strictEqual(payload.headers.Accept, "application/json");
	});
});
