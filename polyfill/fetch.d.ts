/**
 * 统一请求参数。
 * Unified request payload.
 */
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

/**
 * 统一响应结构。
 * Unified response payload.
 */
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

/**
 * 跨平台 `fetch` 函数签名。
 * Cross-platform `fetch` function signature.
 *
 * @param resource 请求对象或 URL / Request object or URL string.
 * @param options 追加参数 / Extra options.
 * @returns 统一响应结构 / Normalized response payload.
 */
export type Fetch = (resource: FetchRequest | string, options?: Partial<FetchRequest>) => Promise<FetchResponse>;
