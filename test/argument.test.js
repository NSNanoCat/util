import assert from "node:assert";
import { describe, it } from "node:test";
import { argument } from "../index.js";

describe("argument", () => {
	it("应该解析字符串参数", () => {
		const result = argument("foo=bar&count=1");
		assert.deepStrictEqual(result, { foo: "bar", count: "1" });
	});

	it("应该处理对象参数", () => {
		const result = argument({ "nested.value": "ok" });
		assert.deepStrictEqual(result, { nested: { value: "ok" } });
	});
});
