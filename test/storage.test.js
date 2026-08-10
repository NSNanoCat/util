import assert from "node:assert";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import { Storage } from "../polyfill/Storage.mjs";

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
	it("应该在 Vercel ESM 运行时通过 /tmp 读写数据", () => {
		process.env.VERCEL = "1";
		Storage.dataFile = `nsnanocat-util-storage-${process.pid}-${Date.now()}.json`;
		dataFilePath = join("/tmp", Storage.dataFile);

		assert.strictEqual(Storage.setItem("profile", { enabled: true }), true);
		assert.strictEqual(existsSync(dataFilePath), true);
		assert.deepStrictEqual(Storage.getItem("profile"), { enabled: true });
	});
});
