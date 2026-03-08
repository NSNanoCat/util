import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const argumentModule = new URL("../lib/argument.mjs", import.meta.url);
const packageEntryModule = new URL("../index.js", import.meta.url);
const runnerModule = new URL("./fixtures/argument.runner.mjs", import.meta.url);

const runImport = ({ entry, value, exportMode = "global" }) => {
	const payload = JSON.stringify({
		entry: entry.href,
		exportMode,
		hasArgument: typeof value !== "undefined",
		...(typeof value !== "undefined" ? { argument: value } : {}),
	});
	const { error, status, stdout, stderr } = spawnSync(process.execPath, [fileURLToPath(runnerModule), payload], {
		encoding: "utf8",
	});
	if (error) throw error;
	if (status !== 0) {
		throw new Error(stderr || `Subprocess exited with status ${status}`);
	}
	return JSON.parse(stdout);
};

describe("argument", () => {
	it("应该解析字符串参数", () => {
		const { result, globalArgument } = runImport({ entry: argumentModule, value: "foo=bar&count=1" });
		assert.deepStrictEqual(result, { foo: "bar", count: "1" });
		assert.deepStrictEqual(globalArgument, { foo: "bar", count: "1" });
	});

	it("应该解析点号路径参数", () => {
		const { result, globalArgument } = runImport({ entry: argumentModule, value: "a.b.c=123&a.d=456" });
		assert.deepStrictEqual(result, { a: { b: { c: "123" }, d: "456" } });
		assert.deepStrictEqual(globalArgument, { a: { b: { c: "123" }, d: "456" } });
	});

	it("应该解析带双引号的参数值", () => {
		const { result, globalArgument } = runImport({ entry: argumentModule, value: 'a.b.c="[1,2,3]"&a.d="456"' });
		assert.deepStrictEqual(result, { a: { b: { c: "[1,2,3]" }, d: "456" } });
		assert.deepStrictEqual(globalArgument, { a: { b: { c: "[1,2,3]" }, d: "456" } });
	});

	it("应该处理对象参数", () => {
		const { result, globalArgument } = runImport({ entry: argumentModule, value: { "nested.value": "ok" } });
		assert.deepStrictEqual(result, { nested: { value: "ok" } });
		assert.deepStrictEqual(globalArgument, { nested: { value: "ok" } });
	});

	it("应该处理未定义参数", () => {
		const { result, globalArgument } = runImport({ entry: argumentModule });
		assert.deepStrictEqual(result, {});
		assert.deepStrictEqual(globalArgument, {});
	});

	it("应该支持全局 $argument", () => {
		const { result, globalArgument } = runImport({ entry: argumentModule, value: "mode=on" });
		assert.deepStrictEqual(result, { mode: "on" });
		assert.deepStrictEqual(globalArgument, { mode: "on" });
	});

	it("应该从包入口导出 $argument 快照", () => {
		const { result, globalArgument } = runImport({
			entry: packageEntryModule,
			value: "a.b=1",
			exportMode: "module",
		});
		assert.deepStrictEqual(result.$argument, { a: { b: "1" } });
		assert.deepStrictEqual(result.argument, { a: { b: "1" } });
		assert.deepStrictEqual(globalArgument, { a: { b: "1" } });
	});
});
