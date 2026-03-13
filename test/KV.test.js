import assert from "node:assert";
import { afterEach, describe, it } from "node:test";
import { cp, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DELETE = Symbol("delete");
const tempDirs = new Set();
const touchedKeys = new Set();
const originalDescriptors = new Map();
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const patchGlobal = (key, value) => {
	if (!originalDescriptors.has(key)) originalDescriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
	touchedKeys.add(key);
	if (value === DELETE) {
		Reflect.deleteProperty(globalThis, key);
		return;
	}
	Reflect.defineProperty(globalThis, key, {
		value,
		configurable: true,
		enumerable: true,
		writable: true,
	});
};

const createFixture = async () => {
	const dir = await mkdtemp(path.join(os.tmpdir(), "nsnanocat-util-kv-"));
	tempDirs.add(dir);
	await cp(path.join(repoRoot, "lib"), path.join(dir, "lib"), { recursive: true });
	await cp(path.join(repoRoot, "polyfill"), path.join(dir, "polyfill"), { recursive: true });
	await cp(path.join(repoRoot, "index.js"), path.join(dir, "index.js"));
	return dir;
};

const importFixture = async (dir, file) => import(pathToFileURL(path.join(dir, file)).href);

afterEach(async () => {
	for (const key of touchedKeys) {
		const descriptor = originalDescriptors.get(key);
		if (descriptor) Reflect.defineProperty(globalThis, key, descriptor);
		else Reflect.deleteProperty(globalThis, key);
	}
	touchedKeys.clear();
	originalDescriptors.clear();
	for (const dir of tempDirs) await rm(dir, { recursive: true, force: true });
	tempDirs.clear();
});

describe("KV", () => {
	it("Worker 应该使用传入的 namespace 且 get 不传 type 参数", async () => {
		patchGlobal("Cloudflare", {});
		const dir = await createFixture();
		const { KV } = await importFixture(dir, "polyfill/KV.mjs");
		const store = new Map();
		const calls = [];
		const namespace = {
			async get(...args) {
				calls.push(["get", args]);
				return store.get(args[0]) ?? null;
			},
			async put(...args) {
				calls.push(["put", args]);
				store.set(args[0], args[1]);
			},
			async delete(...args) {
				calls.push(["delete", args]);
				store.delete(args[0]);
			},
			async list(...args) {
				calls.push(["list", args]);
				return {
					keys: [{ name: "settings" }],
					list_complete: true,
					cursor: "",
				};
			},
		};
		const kv = new KV(namespace);

		assert.strictEqual(await kv.setItem("plain", "value"), true);
		assert.strictEqual(await kv.getItem("plain"), "value");
		assert.deepStrictEqual(calls[1], ["get", ["plain"]]);

		assert.strictEqual(await kv.setItem("@settings.user.name", "clyne"), true);
		assert.strictEqual(await kv.getItem("@settings.user.name"), "clyne");
		assert.strictEqual(await kv.setItem("@settings.flags", { enabled: true }), true);
		assert.deepStrictEqual(await kv.getItem("@settings.flags"), { enabled: true });
		assert.strictEqual(await kv.removeItem("@settings.user.name"), true);
		assert.strictEqual(await kv.getItem("@settings.user.name", null), null);
		assert.strictEqual(await kv.removeItem("plain"), true);
		assert.strictEqual(await kv.getItem("plain", null), null);
		assert.deepStrictEqual(await kv.list({ prefix: "set", limit: 10, cursor: "next" }), {
			keys: [{ name: "settings" }],
			list_complete: true,
			cursor: "",
		});
		assert.deepStrictEqual(calls.at(-1), ["list", [{ prefix: "set", limit: 10, cursor: "next" }]]);
		assert.strictEqual(await kv.clear(), false);
	});

	it("非 Worker 平台应该回退到 Storage，并保持 clear 返回 false", async () => {
		patchGlobal("Cloudflare", DELETE);
		patchGlobal("$task", {});
		const prefStore = new Map();
		patchGlobal("$prefs", {
			valueForKey(key) {
				return prefStore.get(key) ?? null;
			},
			setValueForKey(value, key) {
				prefStore.set(key, value);
				return true;
			},
			removeValueForKey(key) {
				return prefStore.delete(key);
			},
			removeAllValues() {
				prefStore.clear();
				return true;
			},
		});
		const dir = await createFixture();
		const { KV } = await importFixture(dir, "polyfill/KV.mjs");
		const { KV: PackageKV } = await importFixture(dir, "index.js");
		const kv = new KV();

		assert.strictEqual(PackageKV, KV);
		assert.strictEqual(await kv.setItem("node-key", { enabled: true }), true);
		assert.deepStrictEqual(await kv.getItem("node-key"), { enabled: true });
		assert.strictEqual(await kv.removeItem("node-key"), true);
		assert.strictEqual(await kv.getItem("node-key", null), null);
		assert.strictEqual(await kv.setItem("keep", "ok"), true);
		await assert.rejects(() => kv.list(), /Worker runtime/);
		assert.strictEqual(await kv.clear(), false);
		assert.strictEqual(await kv.getItem("keep"), "ok");
	});
});
