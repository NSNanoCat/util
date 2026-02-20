declare module "@nsnanocat/util" {
	export type AppName = "Quantumult X" | "Loon" | "Shadowrocket" | "Node.js" | "Egern" | "Surge" | "Stash";

	export const $app: AppName | undefined;
	export const $argument: Record<string, unknown>;
	export const argument: typeof $argument;

	export interface DonePayload {
		status?: number | string;
		url?: string;
		headers?: Record<string, unknown>;
		body?: string | ArrayBuffer | ArrayBufferView;
		bodyBytes?: ArrayBuffer;
		policy?: string;
	}

	export function done(object?: DonePayload): void;

	export interface NotificationContentObject {
		open?: string;
		"open-url"?: string;
		url?: string;
		openUrl?: string;
		copy?: string;
		"update-pasteboard"?: string;
		updatePasteboard?: string;
		media?: string;
		"media-url"?: string;
		mediaUrl?: string;
		mime?: string;
		"auto-dismiss"?: number;
		sound?: string;
	}

	export type NotificationContent = NotificationContentObject | string | number | boolean;

	export function notification(
		title?: string,
		subtitle?: string,
		body?: string,
		content?: NotificationContent,
	): void;

	export function time(format: string, ts?: number): string;
	export function wait(delay?: number): Promise<void>;

	export interface FetchRequest {
		url: string;
		method?: string;
		headers?: Record<string, unknown>;
		body?: string | ArrayBuffer | ArrayBufferView | object;
		bodyBytes?: ArrayBuffer;
		timeout?: number | string;
		policy?: string;
		redirection?: boolean;
		"auto-redirect"?: boolean;
		opts?: Record<string, unknown>;
		[key: string]: unknown;
	}

	export interface FetchResponse {
		ok: boolean;
		status: number;
		statusCode?: number;
		statusText?: string;
		headers?: Record<string, unknown>;
		body?: string | ArrayBuffer;
		bodyBytes?: ArrayBuffer;
		[key: string]: unknown;
	}

	export function fetch(resource: FetchRequest | string, options?: Partial<FetchRequest>): Promise<FetchResponse>;

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

	export const StatusTexts: Record<number, string>;

	export class Storage {
		static data: Record<string, unknown> | null;
		static dataFile: string;
		static getItem<T = unknown>(keyName: string, defaultValue?: T): T;
		static setItem(keyName: string, keyValue: unknown): boolean;
		static removeItem(keyName: string): boolean;
		static clear(): boolean;
	}
}

declare module "@nsnanocat/util/getStorage.mjs" {
	export interface StorageProfile {
		Settings: Record<string, unknown>;
		Configs: Record<string, unknown>;
		Caches: Record<string, unknown>;
	}

	export default function getStorage(
		key: string,
		names: string | string[] | Array<string | string[]>,
		database: Record<string, unknown>,
	): StorageProfile;
}

declare module "@nsnanocat/util/lib/environment.mjs" {
	export const $environment: Record<string, unknown>;
	export function environment(): Record<string, unknown>;
}
