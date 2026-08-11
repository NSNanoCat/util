import assert from "node:assert";
import { execFile } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { Storage } from "@nsnanocat/util";

const executeFile = promisify(execFile);
const indexCjsPath = fileURLToPath(new URL("../index.cjs", import.meta.url));
const originalDataFile = Storage.dataFile;
const originalVercel = process.env.VERCEL;
let dataFilePath;

afterEach(() => {
	Storage.data = null;
	Storage.dataFile = originalDataFile;
	if (originalVercel === undefined) delete process.env.VERCEL;
	else process.env.VERCEL = originalVercel;
	if (dataFilePath) rmSync(dataFilePath, { force: true });
	dataFilePath = undefined;
});

describe("Storage", () => {
	it("应该在 Node.js ESM 运行时通过当前目录读写数据", () => {
		Reflect.deleteProperty(process.env, "VERCEL");
		Storage.dataFile = `nsnanocat-util-storage-${process.pid}-${Date.now()}.json`;
		dataFilePath = join(process.cwd(), Storage.dataFile);

		assert.strictEqual(Storage.setItem("profile", { enabled: true }), true);
		assert.strictEqual(existsSync(dataFilePath), true);
		assert.deepStrictEqual(Storage.getItem("profile"), { enabled: true });
	});

	it("应该在 Vercel ESM 运行时通过 /tmp 读写数据", () => {
		assert.match(import.meta.resolve("@nsnanocat/util/polyfill/Storage"), /Storage\.node\.mjs$/);
		process.env.VERCEL = "1";
		Storage.dataFile = `nsnanocat-util-storage-${process.pid}-${Date.now()}.json`;
		dataFilePath = join("/tmp", Storage.dataFile);

		assert.strictEqual(Storage.setItem("profile", { enabled: true }), true);
		assert.strictEqual(existsSync(dataFilePath), true);
		assert.deepStrictEqual(Storage.getItem("profile"), { enabled: true });
	});

	it("通用 ESM 路径不应依赖 Node.js 模块", async () => {
		const moduleURL = new URL("../polyfill/Storage.mjs", import.meta.url);
		const script = `
			Reflect.deleteProperty(globalThis, "process");
			globalThis.Cloudflare = {};
			const { Storage } = await import(${JSON.stringify(moduleURL.href)});
			const set = Storage.setItem("profile", { enabled: true });
			console.log(JSON.stringify({ set, profile: Storage.getItem("profile") }));
		`;
		const { stdout } = await executeFile(process.execPath, ["--input-type=module", "--eval", script]);

		assert.deepStrictEqual(JSON.parse(stdout), {
			set: true,
			profile: { enabled: true },
		});
	});

	it("CommonJS 路径不应 require ESM 文件", async () => {
		const script = `
			const { Storage } = require(${JSON.stringify(indexCjsPath)});
			const fs = require("node:fs");
			const dataFile = "/tmp/nsnanocat-util-storage-cjs-" + process.pid + ".json";
			try {
				Storage.dataFile = dataFile;
				const set = Storage.setItem("@profile.enabled", true);
				const get = Storage.getItem("@profile.enabled");
				const remove = Storage.removeItem("@profile.enabled");
				console.log(JSON.stringify({ set, get, remove }));
			} finally {
				fs.rmSync(dataFile, { force: true });
			}
		`;
		const { stdout } = await executeFile(process.execPath, ["--no-experimental-require-module", "--eval", script]);

		assert.deepStrictEqual(JSON.parse(stdout), {
			set: true,
			get: true,
			remove: true,
		});
	});
});
