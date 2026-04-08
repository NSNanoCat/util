import assert from "node:assert";
import { describe, it } from "node:test";

import { qs } from "../polyfill/qs.mjs";

describe("qs", () => {
	it("应该解析基础查询字符串", () => {
		assert.deepStrictEqual(qs.parse("foo=bar&count=1"), {
			foo: "bar",
			count: "1",
		});
	});

	it("应该解析方括号嵌套对象与数组", () => {
		assert.deepStrictEqual(qs.parse("list[0]=x&list[1]=y"), {
			list: ["x", "y"],
		});
	});

	it("应该解析 URL 编码后的路径和值", () => {
		assert.deepStrictEqual(qs.parse("a%5Bb%5D=c%20d"), {
			a: { b: "c d" },
		});
	});

	it("应该支持前导问号", () => {
		assert.deepStrictEqual(qs.parse("?a=1&b=2"), {
			a: "1",
			b: "2",
		});
	});

	it("应该将加号解析为空格", () => {
		assert.deepStrictEqual(qs.parse("a+b=c+d"), {
			"a b": "c d",
		});
	});

	it("应该解析点号路径", () => {
		assert.deepStrictEqual(qs.parse("a.b.c=123&name=Virgil"), {
			a: { b: { c: "123" } },
			name: "Virgil",
		});
	});

	it("应该解析点号与方括号混合路径", () => {
		assert.deepStrictEqual(qs.parse("a.b[0].c=1&a.b[1].c=2"), {
			a: { b: [{ c: "1" }, { c: "2" }] },
		});
	});

	it("应该解析方括号数字索引为数组", () => {
		const parsed = qs.parse("a[0]=x&a[10]=y");
		assert.ok(Array.isArray(parsed.a));
		assert.strictEqual(parsed.a.length, 11);
		assert.strictEqual(parsed.a[0], "x");
		assert.strictEqual(parsed.a[10], "y");
	});

	it("应该将方括号字符键按路径展开", () => {
		assert.deepStrictEqual(qs.parse("a[b.c]=1"), {
			a: { b: { c: "1" } },
		});
	});

	it("应该去除双引号", () => {
		assert.deepStrictEqual(qs.parse('a.b.c="[1,2,3]"&a.d="456"'), {
			a: { b: { c: "[1,2,3]" }, d: "456" },
		});
	});

	it("应该归一化对象参数", () => {
		assert.deepStrictEqual(qs.parse({ "nested.value": "ok" }), {
			nested: { value: "ok" },
		});
	});

	it("应该处理空值参数", () => {
		assert.deepStrictEqual(qs.parse(null), {});
		assert.deepStrictEqual(qs.parse(undefined), {});
	});

	it("应该序列化为方括号格式", () => {
		assert.strictEqual(
			qs.stringify({
				a: { b: "1" },
				list: ["x", "y"],
			}),
			"a.b=1&list%5B0%5D=x&list%5B1%5D=y",
		);
	});

	it("应该序列化多层路径", () => {
		assert.strictEqual(
			qs.stringify({
				a: { b: { c: "123" } },
				list: ["x", "y"],
			}),
			"a.b.c=123&list%5B0%5D=x&list%5B1%5D=y",
		);
	});

	it("应该对序列化结果进行 URL 编码", () => {
		assert.strictEqual(
			qs.stringify({
				a: { b: "c d" },
			}),
			"a.b=c%20d",
		);
	});

	it("应该序列化 null 并跳过 undefined", () => {
		assert.strictEqual(
			qs.stringify({
				a: null,
				b: undefined,
			}),
			"a=",
		);
	});
});
