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

	it("应该处理未定义参数", () => {
		const result = argument();
		assert.deepStrictEqual(result, {});
	});

	it("应该支持全局 $argument", () => {
		globalThis.$argument = "mode=on";
		const result = argument();
		assert.deepStrictEqual(result, { mode: "on" });
		assert.deepStrictEqual(globalThis.$argument, { mode: "on" });
		delete globalThis.$argument;
	});
});
