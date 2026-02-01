import { Lodash as _ } from "../polyfill/Lodash.mjs";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("Lodash.merge", () => {
	describe("基础合并", () => {
		it("应该合并两个简单对象", () => {
			const target = { a: 1, b: 2 };
			const source = { c: 3 };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: 1, b: 2, c: 3 });
		});

		it("应该用源对象覆盖目标对象的同名属性", () => {
			const target = { a: 1, b: 2 };
			const source = { b: 3 };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: 1, b: 3 });
		});

		it("应该返回修改后的目标对象（mutates target）", () => {
			const target = { a: 1 };
			const source = { b: 2 };
			const result = _.merge(target, source);
			assert.strictEqual(result, target);
		});
	});

	describe("深度合并", () => {
		it("应该递归合并嵌套对象", () => {
			const target = { a: { b: 1, c: 2 } };
			const source = { a: { d: 3 } };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: { b: 1, c: 2, d: 3 } });
		});

		it("应该递归合并多层嵌套对象", () => {
			const target = { a: { b: { c: 1 } } };
			const source = { a: { b: { d: 2 }, e: 3 } };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: { b: { c: 1, d: 2 }, e: 3 } });
		});

		it("嵌套对象中的同名属性应该被覆盖", () => {
			const target = { a: { b: 1, c: 2 } };
			const source = { a: { b: 10 } };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: { b: 10, c: 2 } });
		});
	});

	describe("多个源对象", () => {
		it("应该依次合并多个源对象", () => {
			const target = { a: 1 };
			const source1 = { b: 2 };
			const source2 = { c: 3 };
			const result = _.merge(target, source1, source2);
			assert.deepStrictEqual(result, { a: 1, b: 2, c: 3 });
		});

		it("后面的源对象应该覆盖前面的", () => {
			const target = { a: 1 };
			const source1 = { a: 2, b: 2 };
			const source2 = { a: 3 };
			const result = _.merge(target, source1, source2);
			assert.deepStrictEqual(result, { a: 3, b: 2 });
		});
	});

	describe("数组处理", () => {
		it("数组应该被直接覆盖而不是合并", () => {
			const target = { a: [1, 2, 3] };
			const source = { a: [4, 5] };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: [4, 5] });
		});

		it("对象覆盖数组", () => {
			const target = { a: [1, 2, 3] };
			const source = { a: { b: 1 } };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: { b: 1 } });
		});

		it("数组覆盖对象", () => {
			const target = { a: { b: 1 } };
			const source = { a: [1, 2, 3] };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: [1, 2, 3] });
		});
	});

	describe("特殊值处理", () => {
		it("目标对象为 null 时返回 null", () => {
			const result = _.merge(null, { a: 1 });
			assert.strictEqual(result, null);
		});

		it("目标对象为 undefined 时返回 undefined", () => {
			const result = _.merge(undefined, { a: 1 });
			assert.strictEqual(result, undefined);
		});

		it("源对象为 null 时跳过", () => {
			const target = { a: 1 };
			const result = _.merge(target, null);
			assert.deepStrictEqual(result, { a: 1 });
		});

		it("源对象为 undefined 时跳过", () => {
			const target = { a: 1 };
			const result = _.merge(target, undefined);
			assert.deepStrictEqual(result, { a: 1 });
		});

		it("源属性值为 undefined 时不覆盖目标属性", () => {
			const target = { a: 1, b: 2 };
			const source = { a: undefined, c: 3 };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: 1, b: 2, c: 3 });
		});

		it("源属性值为 null 时覆盖目标属性", () => {
			const target = { a: 1 };
			const source = { a: null };
			const result = _.merge(target, source);
			assert.deepStrictEqual(result, { a: null });
		});
	});

	describe("配置对象合并场景", () => {
		it("应该正确合并典型的配置对象", () => {
			const defaultSettings = {
				theme: "light",
				language: "en",
				notifications: {
					email: true,
					push: true,
					sms: false,
				},
			};
			const userSettings = {
				theme: "dark",
				notifications: {
					push: false,
				},
			};
			const result = _.merge(defaultSettings, userSettings);
			assert.deepStrictEqual(result, {
				theme: "dark",
				language: "en",
				notifications: {
					email: true,
					push: false,
					sms: false,
				},
			});
		});
	});
});
