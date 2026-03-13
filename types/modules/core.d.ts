declare module "@nsnanocat/util" {
	export type AppName =
		| "Quantumult X"
		| "Loon"
		| "Shadowrocket"
		| "Egern"
		| "Surge"
		| "Stash"
		| "Worker"
		| "Node.js";

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
}
