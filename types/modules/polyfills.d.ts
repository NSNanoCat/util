declare module "@nsnanocat/util" {
	export class Console {
		static clear(): void;
		static count(label?: string): void;
		static countReset(label?: string): void;
		static debug(...msg: unknown[]): void;
		static error(...msg: unknown[]): void;
		static exception(...msg: unknown[]): void;
		static group(label: string): number;
		static groupEnd(): string | undefined;
		static info(...msg: unknown[]): void;
		static get logLevel(): "OFF" | "ERROR" | "WARN" | "INFO" | "DEBUG" | "ALL";
		static set logLevel(level: number | string);
		static log(...msg: unknown[]): void;
		static time(label?: string): Map<string, number>;
		static timeEnd(label?: string): boolean;
		static timeLog(label?: string): void;
		static warn(...msg: unknown[]): void;
	}

	export class Lodash {
		static escape(string: string): string;
		static get<T = unknown, D = undefined>(object?: Record<string, unknown>, path?: string | string[], defaultValue?: D): T | D;
		static merge<T extends Record<string, unknown>>(object: T, ...sources: Array<Record<string, unknown> | null | undefined>): T;
		static omit<T extends Record<string, unknown>>(object?: T, paths?: string | string[]): T;
		static pick<T extends Record<string, unknown>, K extends keyof T>(object?: T, paths?: K | K[]): Pick<T, K>;
		static set<T extends Record<string, unknown>>(object: T, path: string | string[], value: unknown): T;
		static toPath(value: string): string[];
		static unescape(string: string): string;
		static unset(object?: Record<string, unknown>, path?: string | string[]): boolean;
	}

	export class qs {
		static parse(query?: string | Record<string, unknown> | null): Record<string, unknown>;

		static stringify(object?: Record<string, unknown>): string;
	}

	export const StatusTexts: Record<number, string>;
}
