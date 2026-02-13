import assert from "node:assert";
import { afterEach, describe, it } from "node:test";

let importSeed = 0;
const argumentModule = new URL("../lib/argument.mjs", import.meta.url);
const importWithArgument = async value => {
	if (typeof value === "undefined") globalThis.$argument = {};
	else globalThis.$argument = value;
	importSeed += 1;
	await import(`${argumentModule}?test=${importSeed}`);
	return globalThis.$argument;
};

describe("argument", () => {
	afterEach(() => {
		globalThis.$argument = {};
	});

	it("应该解析字符串参数", async () => {
		const result = await importWithArgument("foo=bar&count=1");
		assert.deepStrictEqual(result, { foo: "bar", count: "1" });
		assert.deepStrictEqual(globalThis.$argument, { foo: "bar", count: "1" });
	});

	it("应该解析点号路径参数", async () => {
		const result = await importWithArgument("a.b.c=123&a.d=456");
		assert.deepStrictEqual(result, { a: { b: { c: "123" }, d: "456" } });
		assert.deepStrictEqual(globalThis.$argument, { a: { b: { c: "123" }, d: "456" } });
	});

	it("应该解析带双引号的参数值", async () => {
		const result = await importWithArgument('a.b.c="[1,2,3]"&a.d="456"');
		assert.deepStrictEqual(result, { a: { b: { c: "[1,2,3]" }, d: "456" } });
		assert.deepStrictEqual(globalThis.$argument, { a: { b: { c: "[1,2,3]" }, d: "456" } });
	});

	it("应该处理对象参数", async () => {
		const result = await importWithArgument({ "nested.value": "ok" });
		assert.deepStrictEqual(result, { nested: { value: "ok" } });
		assert.deepStrictEqual(globalThis.$argument, { nested: { value: "ok" } });
	});

	it("应该处理未定义参数", async () => {
		const result = await importWithArgument();
		assert.deepStrictEqual(result, {});
		assert.deepStrictEqual(globalThis.$argument, {});
	});

	it("应该支持全局 $argument", async () => {
		const result = await importWithArgument("mode=on");
		assert.deepStrictEqual(result, { mode: "on" });
		assert.deepStrictEqual(globalThis.$argument, { mode: "on" });
	});
});
