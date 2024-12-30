import { set } from 'lodash';
import { $app } from '../lib/app';
import { StatusTexts } from './StatusTexts';

declare const $task: {
  fetch: (options: FetchOptions) => Promise<any>;
};

declare const $httpClient: {
  [method: string]: (resource: any, callback: (error: any, response: any, body: any) => void) => void;
};

interface FetchOptions {
  url?: string;
  method?: string;
  headers?: Record<string, string | undefined>;
  body?: any;
  bodyBytes?: ArrayBuffer;
  timeout: number;
  policy?: string;
  node?: string;
  redirection?: boolean;
  redirect?: string;
  'auto-redirect'?: boolean;
  'binary-mode'?: boolean;
}

interface FetchResponse<T = any> {
  ok: boolean;
  status: number;
  statusCode: number;
  statusText: string;
  body: T;
  bodyBytes?: ArrayBuffer;
  headers: Record<string, string>;
}

// 定义需要二进制模式的 MIME 类型
const binaryMimeTypes = [
  'application/protobuf',
  'application/x-protobuf',
  'application/vnd.google.protobuf',
  'application/vnd.apple.flatbuffer',
  'application/grpc',
  'application/grpc+proto',
  'application/octet-stream',
];

export async function fetch<T>(
  resource: string | FetchOptions,
  options: FetchOptions = {
    timeout: 5,
  },
): Promise<FetchResponse<T>> {
  let params = { ...options };
  // 初始化参数
  if (typeof resource === 'string') {
    params.url = resource;
  } else if (typeof resource === 'object') {
    params = { ...params, ...resource };
  } else {
    throw new TypeError(`${Function.name}: 参数类型错误, resource 必须为对象或字符串`);
  }

  // 自动判断请求方法
  if (!params.method) {
    params.method = 'GET';
    if (params.body || params.bodyBytes) {
      params.method = 'POST';
    }
  }

  // 移除请求头中的部分参数, 让其自动生成
  if (params.headers) {
    params.headers.Host = undefined;
    params.headers[':authority'] = undefined;
    params.headers['Content-Length'] = undefined;
    params.headers['content-length'] = undefined;
  }

  // 定义请求方法（小写）
  const method = params.method.toLocaleLowerCase();

  // 转换请求超时时间参数
  if (params.timeout) {
    params.timeout = Number.parseInt(params.timeout.toString(), 10);
    // 转换为秒，大于500视为毫秒，小于等于500视为秒
    if (params.timeout > 500) {
      params.timeout = Math.round(params.timeout / 1000);
    }
  }

  if ($app === 'Quantumult X') {
    // 转换请求参数
    if (params.policy) {
      set(params, 'opts.policy', params.policy);
    }
    if (typeof params['auto-redirect'] === 'boolean') {
      set(params, 'opts.redirection', params['auto-redirect']);
    }
    // 转换请求体
    if (params.body instanceof ArrayBuffer) {
      params.bodyBytes = params.body;
      params.body = undefined;
    } else if (ArrayBuffer.isView(params.body)) {
      params.bodyBytes = params.body.buffer.slice(
        params.body.byteOffset,
        params.body.byteLength + params.body.byteOffset,
      );
      params.body = undefined;
    } else if (params.body) {
      params.bodyBytes = undefined;
    }
    // 发送请求
    return Promise.race([
      await $task.fetch(params).then(
        (response) => {
          response.ok = /^2\d\d$/.test(response.statusCode);
          response.status = response.statusCode;
          response.statusText = StatusTexts[response.status as keyof typeof StatusTexts];
          if (
            binaryMimeTypes.includes(
              (response.headers?.['Content-Type'] ?? response.headers?.['content-type'])?.split(';')?.[0],
            )
          ) {
            response.body = response.bodyBytes;
          }
          response.bodyBytes = undefined;
          return response;
        },
        (reason) => Promise.reject(reason.error),
      ),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${Function.name}: 请求超时, 请检查网络后重试`));
        }, params.timeout);
      }),
    ]);
  }

  if ($app === 'Node.js') {
    const nodeFetch = globalThis.fetch ? globalThis.fetch : await import('node-fetch').then((module) => module.default);
    const fetchCookie = (globalThis as any).fetchCookie
      ? (globalThis as any).fetchCookie
      : await import('fetch-cookie').then((module) => module.default);
    const fetch = fetchCookie(nodeFetch);
    // 转换请求参数
    params.timeout = (params.timeout ?? 5) * 1000;
    params.redirect = params.redirection ? 'follow' : 'manual';
    const { url, ...options } = params;
    // 发送请求
    return Promise.race([
      await fetch(url, options)
        .then(async (response: any) => {
          const bodyBytes = await response.arrayBuffer();
          let headers: any;
          try {
            headers = response.headers.raw();
          } catch {
            headers = Array.from(response.headers.entries()).reduce<any>((acc, item) => {
              const [key, value] = item as [string, string];
              acc[key] = acc[key] ? [...acc[key], value] : [value];
              return acc;
            }, {});
          }
          return {
            ok: response.ok ?? /^2\d\d$/.test(response.status),
            status: response.status,
            statusCode: response.status,
            statusText: response.statusText,
            body: new TextDecoder('utf-8').decode(bodyBytes),
            bodyBytes: bodyBytes,
            headers: Object.fromEntries(
              Object.entries(headers).map(([key, value]) => [
                key,
                key.toLowerCase() !== 'set-cookie' ? (value as any).toString() : value,
              ]),
            ),
          };
        })
        .catch((error: Error) => Promise.reject(error.message)),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error(`${Function.name}: 请求超时, 请检查网络后重试`));
        }, params.timeout);
      }),
    ]);
  }

  if ($app === 'Loon') {
    params.timeout *= 1000;
  }
  if (params.policy) {
    switch ($app) {
      case 'Loon':
        params.node = params.policy;
        break;
      case 'Stash':
        set(params, 'headers.X-Stash-Selected-Proxy', encodeURI(params.policy));
        break;
      case 'Shadowrocket':
        set(params, 'headers.X-Surge-Proxy', params.policy);
        break;
      default:
        break;
    }
  }
  if (typeof params.redirection === 'boolean') {
    params['auto-redirect'] = params.redirection;
  }
  // 转换请求体
  if (params.bodyBytes && !params.body) {
    params.body = params.bodyBytes;
    params.bodyBytes = undefined;
  }
  // 判断是否请求二进制响应体
  if (binaryMimeTypes.includes((params.headers?.Accept || params.headers?.accept)?.split(';')?.[0] ?? '')) {
    params['binary-mode'] = true;
  }
  return new Promise((resolve, reject) => {
    $httpClient[method](params, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        response.ok = /^2\d\d$/.test(response.status);
        response.statusCode = response.status;
        response.statusText = StatusTexts[response.status as keyof typeof StatusTexts];
        if (body) {
          response.body = body;
          if (params['binary-mode']) {
            response.bodyBytes = body;
          }
        }
        resolve(response);
      }
    });
  });
}
