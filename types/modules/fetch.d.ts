declare module "@nsnanocat/util" {
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
		"auto-cookie"?: boolean | number | string;
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
}
