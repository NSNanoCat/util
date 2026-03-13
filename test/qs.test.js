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

	it("应该解析点号路径", () => {
		assert.deepStrictEqual(qs.parse("a.b.c=123&name=Virgil"), {
			a: { b: { c: "123" } },
			name: "Virgil",
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
});
