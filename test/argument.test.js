import assert from "node:assert";
import { afterEach, describe, it } from "node:test";

let importSeed = 0;
const loadArgument = async value => {
	if (typeof value === "undefined") delete globalThis.$argument;
	else globalThis.$argument = value;
	importSeed += 1;
	const { argument } = await import(`../lib/argument.mjs?test=${importSeed}`);
	return argument;
};

describe("argument", () => {
	afterEach(() => {
		delete globalThis.$argument;
	});

	it("应该解析字符串参数", async () => {
		const result = await loadArgument("foo=bar&count=1");
		assert.deepStrictEqual(result, { foo: "bar", count: "1" });
		assert.deepStrictEqual(globalThis.$argument, { foo: "bar", count: "1" });
	});

	it("应该处理对象参数", async () => {
		const result = await loadArgument({ "nested.value": "ok" });
		assert.deepStrictEqual(result, { nested: { value: "ok" } });
	});

	it("应该处理未定义参数", async () => {
		const result = await loadArgument();
		assert.deepStrictEqual(result, {});
	});

	it("应该支持全局 $argument", async () => {
		const result = await loadArgument("mode=on");
		assert.deepStrictEqual(result, { mode: "on" });
		assert.deepStrictEqual(globalThis.$argument, { mode: "on" });
	});
});
