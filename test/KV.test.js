import assert from "node:assert";
import { afterEach, describe, it } from "node:test";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DELETE = Symbol("delete");
const tempDirs = new Set();
const touchedKeys = new Set();
const originalDescriptors = new Map();
const touchedEnv = new Set();
const originalEnv = new Map();
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

const patchEnv = values => {
	for (const [key, value] of Object.entries(values)) {
		if (!originalEnv.has(key)) originalEnv.set(key, process.env[key]);
		touchedEnv.add(key);
		if (value === DELETE) delete process.env[key];
		else process.env[key] = value;
	}
};

const createResponse = (status, body = "", statusText = "OK") => ({
	ok: status >= 200 && status < 300,
	status,
	statusText,
	async text() {
		return body;
	},
});

const createJSONResponse = (status, body, statusText = "OK") => createResponse(status, JSON.stringify(body), statusText);

afterEach(async () => {
	for (const key of touchedKeys) {
		const descriptor = originalDescriptors.get(key);
		if (descriptor) Reflect.defineProperty(globalThis, key, descriptor);
		else Reflect.deleteProperty(globalThis, key);
	}
	touchedKeys.clear();
	originalDescriptors.clear();
	for (const key of touchedEnv) {
		const value = originalEnv.get(key);
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
	touchedEnv.clear();
	originalEnv.clear();
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
		await assert.rejects(() => kv.list(), /namespace binding or Node\.js REST config/);
		assert.strictEqual(await kv.clear(), false);
		assert.strictEqual(await kv.getItem("keep"), "ok");
	});

	it("Node.js 应优先使用传入的 namespace binding", async () => {
		patchGlobal("Cloudflare", DELETE);
		patchEnv({
			CLOUDFLARE_EMAIL: "env@example.com",
			CLOUDFLARE_API_KEY: "env-key",
			ACCOUNT_ID: "env-account",
			NAMESPACE_ID: "env-namespace",
		});
		patchGlobal("fetch", async () => {
			throw new Error("fetch should not be called when namespace binding exists");
		});
		const dir = await createFixture();
		const { KV } = await importFixture(dir, "polyfill/KV.mjs");
		const store = new Map();
		const calls = [];
		const namespace = {
			async get(key) {
				calls.push(["get", key]);
				return store.get(key) ?? null;
			},
			async put(key, value) {
				calls.push(["put", key, value]);
				store.set(key, value);
			},
			async delete(key) {
				calls.push(["delete", key]);
				store.delete(key);
			},
			async list(options) {
				calls.push(["list", options]);
				return {
					keys: [{ name: "plain" }],
					list_complete: true,
					cursor: "",
				};
			},
		};
		const kv = new KV(namespace);

		assert.strictEqual(await kv.setItem("plain", "value"), true);
		assert.strictEqual(await kv.getItem("plain"), "value");
		assert.deepStrictEqual(await kv.list({ prefix: "pl" }), {
			keys: [{ name: "plain" }],
			list_complete: true,
			cursor: "",
		});
		assert.deepStrictEqual(calls, [
			["put", "plain", "value"],
			["get", "plain"],
			["list", { prefix: "pl" }],
		]);
	});

	it("Node.js 应在 namespace 缺失时使用 Cloudflare KV REST API", async () => {
		patchGlobal("Cloudflare", DELETE);
		const dir = await createFixture();
		const { KV } = await importFixture(dir, "polyfill/KV.mjs");
		const store = new Map();
		const calls = [];
		patchGlobal("fetch", async (url, options = {}) => {
			const requestURL = new URL(String(url));
			calls.push({
				url: requestURL.toString(),
				method: options.method,
				headers: options.headers,
				body: options.body,
			});
			const keyMatch = requestURL.pathname.match(/\/values\/(.+)$/);
			switch (true) {
				case requestURL.pathname.endsWith("/keys") && options.method === "GET": {
					const prefix = requestURL.searchParams.get("prefix") ?? "";
					const keys = Array.from(store.keys())
						.filter(keyName => keyName.startsWith(prefix))
						.map(name => ({ name }));
					return createJSONResponse(200, {
						success: true,
						errors: [],
						messages: [],
						result: keys,
						result_info: {
							count: keys.length,
							cursor: "rest-cursor",
						},
					});
				}
				case Boolean(keyMatch): {
					const keyName = decodeURIComponent(keyMatch[1]);
					switch (options.method) {
						case "GET":
							return store.has(keyName) ? createResponse(200, store.get(keyName)) : createResponse(404, "", "Not Found");
						case "PUT":
							store.set(keyName, options.body);
							return createJSONResponse(200, {
								success: true,
								errors: [],
								messages: [],
								result: null,
							});
						case "DELETE":
							store.delete(keyName);
							return createJSONResponse(200, {
								success: true,
								errors: [],
								messages: [],
								result: null,
							});
						default:
							throw new Error(`Unexpected method: ${options.method}`);
					}
				}
				default:
					throw new Error(`Unexpected URL: ${requestURL.toString()}`);
			}
		});
		const kv = new KV({
			apiEmail: "user@example.com",
			apiKey: "secret-key",
			accountId: "account-id",
			namespaceId: "namespace-id",
		});

		assert.strictEqual(await kv.setItem("plain", "value"), true);
		assert.strictEqual(await kv.getItem("plain"), "value");
		assert.strictEqual(await kv.setItem("@settings.user.name", "clyne"), true);
		assert.strictEqual(await kv.getItem("@settings.user.name"), "clyne");
		assert.strictEqual(await kv.setItem("@settings.flags", { enabled: true }), true);
		assert.deepStrictEqual(await kv.getItem("@settings.flags"), { enabled: true });
		assert.strictEqual(await kv.removeItem("@settings.user.name"), true);
		assert.strictEqual(await kv.getItem("@settings.user.name", null), null);
		assert.strictEqual(await kv.removeItem("plain"), true);
		assert.strictEqual(await kv.getItem("plain", null), null);
		assert.deepStrictEqual(await kv.list({ prefix: "set", limit: 10, cursor: "next-cursor" }), {
			keys: [{ name: "settings" }],
			list_complete: false,
			cursor: "rest-cursor",
		});
		assert.strictEqual(calls[0].url, "https://api.cloudflare.com/client/v4/accounts/account-id/storage/kv/namespaces/namespace-id/values/plain");
		assert.strictEqual(calls[0].method, "PUT");
		assert.deepStrictEqual(calls[0].headers, {
			"X-Auth-Email": "user@example.com",
			"X-Auth-Key": "secret-key",
			"Content-Type": "text/plain;charset=UTF-8",
		});
		assert.strictEqual(calls[0].body, "value");
		assert.strictEqual(
			calls.at(-1).url,
			"https://api.cloudflare.com/client/v4/accounts/account-id/storage/kv/namespaces/namespace-id/keys?prefix=set&limit=10&cursor=next-cursor",
		);
	});

	it("Node.js 应支持从环境变量补齐 REST 配置", async () => {
		patchGlobal("Cloudflare", DELETE);
		patchEnv({
			CLOUDFLARE_EMAIL: "env@example.com",
			CLOUDFLARE_API_KEY: "env-key",
			ACCOUNT_ID: "env-account",
			NAMESPACE_ID: "env-namespace",
		});
		const dir = await createFixture();
		const { KV } = await importFixture(dir, "polyfill/KV.mjs");
		const calls = [];
		patchGlobal("fetch", async (url, options = {}) => {
			calls.push({ url: String(url), method: options.method, headers: options.headers });
			return createResponse(200, "from-env");
		});
		const kv = new KV();

		assert.strictEqual(await kv.getItem("env-key", "missing"), "from-env");
		assert.strictEqual(calls[0].url, "https://api.cloudflare.com/client/v4/accounts/env-account/storage/kv/namespaces/env-namespace/values/env-key");
		assert.deepStrictEqual(calls[0].headers, {
			"X-Auth-Email": "env@example.com",
			"X-Auth-Key": "env-key",
		});
	});

	it("Node.js 在 REST 配置不完整时应该回退到 Storage", async () => {
		patchGlobal("Cloudflare", DELETE);
		patchGlobal("require", createRequire(import.meta.url));
		patchEnv({
			CLOUDFLARE_EMAIL: DELETE,
			CLOUDFLARE_API_KEY: DELETE,
			ACCOUNT_ID: DELETE,
			NAMESPACE_ID: DELETE,
		});
		patchGlobal("fetch", async () => {
			throw new Error("fetch should not be called when REST config is incomplete");
		});
		const dir = await createFixture();
		const { KV } = await importFixture(dir, "polyfill/KV.mjs");
		const originalCwd = process.cwd();
		process.chdir(dir);
		try {
			const kv = new KV({ apiEmail: "partial@example.com" });
			assert.strictEqual(await kv.setItem("node-key", { enabled: true }), true);
			assert.deepStrictEqual(await kv.getItem("node-key"), { enabled: true });
			assert.strictEqual(await kv.removeItem("node-key"), true);
			assert.strictEqual(await kv.getItem("node-key", null), null);
		} finally {
			process.chdir(originalCwd);
		}
	});

	it("Node.js REST 读取 404 时应该返回默认值", async () => {
		patchGlobal("Cloudflare", DELETE);
		const dir = await createFixture();
		const { KV } = await importFixture(dir, "polyfill/KV.mjs");
		patchGlobal("fetch", async () => createResponse(404, "", "Not Found"));
		const kv = new KV({
			apiEmail: "user@example.com",
			apiKey: "secret-key",
			accountId: "account-id",
			namespaceId: "namespace-id",
		});

		assert.strictEqual(await kv.getItem("missing-key", "fallback"), "fallback");
	});

	it("Node.js REST 错误 envelope 应抛出明确异常", async () => {
		patchGlobal("Cloudflare", DELETE);
		const dir = await createFixture();
		const { KV } = await importFixture(dir, "polyfill/KV.mjs");
		patchGlobal("fetch", async () =>
			createJSONResponse(403, {
				success: false,
				errors: [{ code: 1001, message: "auth failed" }],
				messages: [],
				result: null,
			}, "Forbidden"),
		);
		const kv = new KV({
			apiEmail: "user@example.com",
			apiKey: "secret-key",
			accountId: "account-id",
			namespaceId: "namespace-id",
		});

		await assert.rejects(() => kv.setItem("plain", "value"), /1001: auth failed/);
	});
});
