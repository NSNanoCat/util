import assert from "node:assert";
import { afterEach, describe, it } from "node:test";

let importSeed = 0;
const appModule = new URL("../lib/app.mjs", import.meta.url);
const DELETE = Symbol("delete");
const touchedKeys = new Set();
const originalDescriptors = new Map();

const importApp = async () => {
	importSeed += 1;
	const mod = await import(`${appModule}?test=${importSeed}`);
	return mod.$app;
};

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

afterEach(() => {
	for (const key of touchedKeys) {
		const descriptor = originalDescriptors.get(key);
		if (descriptor) Reflect.defineProperty(globalThis, key, descriptor);
		else Reflect.deleteProperty(globalThis, key);
	}
	touchedKeys.clear();
	originalDescriptors.clear();
});

describe("app", () => {
	it("应该在 Node.js 中识别为 Node.js", async () => {
		const app = await importApp();
		assert.strictEqual(app, "Node.js");
	});

	it("仅存在 Cloudflare 风格 userAgent 时仍应识别为 Node.js", async () => {
		patchGlobal("navigator", { userAgent: "Cloudflare-Workers" });
		patchGlobal("process", { versions: { node: "22.0.0" } });

		const app = await importApp();
		assert.strictEqual(app, "Node.js");
	});

	it("存在 Cloudflare Workers 全局标记时应优先识别为 Worker", async () => {
		patchGlobal("Cloudflare", {});
		patchGlobal("ServiceWorkerGlobalScope", class ServiceWorkerGlobalScope {});
		patchGlobal("self", globalThis);
		patchGlobal("caches", {});
		patchGlobal("scheduler", {});
		patchGlobal("process", { versions: { node: "22.0.0" } });

		const app = await importApp();
		assert.strictEqual(app, "Worker");
	});

	it("存在 WebSocketPair/caches 标记时仍应识别为 Node.js", async () => {
		patchGlobal("navigator", { userAgent: "Node.js/22" });
		patchGlobal("WebSocketPair", class WebSocketPair {});
		patchGlobal("caches", {});
		patchGlobal("process", { versions: { node: "22.0.0" } });

		const app = await importApp();
		assert.strictEqual(app, "Node.js");
	});
});
