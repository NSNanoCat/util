import assert from "node:assert";
import { afterEach, describe, it } from "node:test";

let importSeed = 0;
const consoleModule = new URL("../polyfill/Console.mjs", import.meta.url);
const notificationModule = new URL("../lib/notification.mjs", import.meta.url);
const originalConsoleLog = console.log;
let capturedLogs = [];

afterEach(() => {
	console.log = originalConsoleLog;
	capturedLogs = [];
});

describe("Console.log", () => {
	it("应该将多行字符串拆分为多行日志并保留空行", async () => {
		console.log = message => capturedLogs.push(message);

		importSeed += 1;
		const { Console } = await import(`${consoleModule}?test=${importSeed}`);
		Console.log("a", "b\nc\r\n\r\nd", "e");

		assert.deepStrictEqual(capturedLogs, ["\na\nb\nc\n\nd\ne"]);
	});

	it("应该保留数组参数为单个日志项", async () => {
		console.log = message => capturedLogs.push(message);

		importSeed += 1;
		const { Console } = await import(`${consoleModule}?test=${importSeed}`);
		Console.log("a", ["b", "c"], "d");

		assert.deepStrictEqual(capturedLogs, ['\na\n["b","c"]\nd']);
	});

	it("应该在日志分组中逐行缩进多行字符串与格式化 JSON", async () => {
		console.log = message => capturedLogs.push(message);

		importSeed += 1;
		const { Console } = await import(`${consoleModule}?test=${importSeed}`);
		Console.group("测试分组");
		Console.log("title", "body1\nbody2", JSON.stringify({ url: "https://example.com" }, null, 2));
		Console.groupEnd();

		assert.deepStrictEqual(capturedLogs, ['\n▼ 测试分组:\n  title\n  body1\n  body2\n  {\n    "url": "https://example.com"\n  }']);
	});
});

describe("notification", () => {
	it("应该按换行拆分 body 并保留空行", async () => {
		console.log = message => capturedLogs.push(message);

		importSeed += 1;
		const { notification } = await import(`${notificationModule}?test=${importSeed}`);
		notification("title", "subtitle", "line1\nline2\r\n\r\nline4");

		assert.deepStrictEqual(capturedLogs, ["\n▼ 📣 系统通知:\n  title\n  subtitle\n  line1\n  line2\n  \n  line4\n  {}"]);
		assert.ok(!capturedLogs[0].includes("\r"));
	});
});
