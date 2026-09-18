import assert from "node:assert";
import { describe, it } from "node:test";

globalThis.$environment = { "surge-version": "test" };
globalThis.$persistentStore = {
	read() {
		return JSON.stringify({
			WeatherKit: {
				Settings: {
					shared: "persistent",
					persistentOnly: true,
					nested: { persistent: true },
					selected: ["4021", "4022"],
					cleared: [],
				},
			},
		});
	},
	write() {
		return true;
	},
};
globalThis.$argument = {
	Storage: "PersistentStore",
	shared: "argument",
	argumentOnly: true,
	nested: { argument: true },
};

const { default: getStorage } = await import("../getStorage.mjs?test=getStorage");

const database = {
	Default: { Settings: { shared: "default", defaultOnly: true } },
	WeatherKit: {
		Settings: {
			shared: "database",
			databaseOnly: true,
			nested: { database: true },
			selected: [407, 410],
			cleared: [1, 3],
		},
		Configs: { available: true },
	},
};

const getSettings = storageMode => {
	globalThis.$argument = storageMode === undefined ? { ...globalThis.$argument, Storage: undefined } : { ...globalThis.$argument, Storage: storageMode };
	const { Storage, ...settings } = getStorage("iRingo", "WeatherKit", database).Settings;
	return settings;
};

describe("getStorage", () => {
	it("PersistentStore 模式应与未设置模式一致，并让 PersistentStore 覆盖 $argument", () => {
		const expected = {
			shared: "persistent",
			defaultOnly: true,
			databaseOnly: true,
			argumentOnly: true,
			persistentOnly: true,
			nested: { database: true, argument: true, persistent: true },
			selected: [4021, 4022],
			cleared: [],
		};

		assert.deepStrictEqual(getSettings("PersistentStore"), expected);
		assert.deepStrictEqual(getSettings(undefined), expected);
	});

	it("PersistentStore 别名应使用相同的合并顺序", () => {
		const expected = getSettings("PersistentStore");

		for (const alias of ["BoxJs", "boxjs", "$persistentStore"]) {
			assert.deepStrictEqual(getSettings(alias), expected);
		}
	});
});
