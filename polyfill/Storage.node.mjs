import * as fs from "node:fs";
import * as path from "node:path";
import { Storage } from "./Storage.mjs";

function resolveDataFilePaths(dataFile) {
	const currentDataFilePath = path.resolve(process.cwd(), dataFile);
	switch (process.env.VERCEL) {
		case "1":
			return [path.resolve("/tmp", dataFile), currentDataFilePath];
		default:
			return [currentDataFilePath];
	}
}

Storage.nodeBackend = {
	load(dataFile) {
		const dataFilePaths = resolveDataFilePaths(dataFile);
		const dataFilePath = dataFilePaths.find(dataPath => fs.existsSync(dataPath));
		switch (dataFilePath) {
			case undefined:
				return {};
			default:
				try {
					return JSON.parse(fs.readFileSync(dataFilePath));
				} catch {
					return {};
				}
		}
	},
	write(dataFile, data) {
		const [dataFilePath] = resolveDataFilePaths(dataFile);
		fs.writeFileSync(dataFilePath, JSON.stringify(data));
	},
};

export { Storage };
