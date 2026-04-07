const assert = require("node:assert");
const { describe, it } = require("node:test");
const { fetch } = require("../index.cjs");

describe("fetch (cjs)", () => {
	it("应该在 Node.js 中成功请求 httpbin", async () => {
		const response = await fetch("https://httpbin.org/get", {
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
