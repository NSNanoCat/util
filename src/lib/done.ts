import { pick, set } from 'lodash';
import { Console } from '../polyfill/Console';
import { StatusTexts } from '../polyfill/StatusTexts';
import { $app } from './app';

interface DoneObject {
  status?: number | string;
  url?: string;
  headers?: Record<string, string>;
  body?: ArrayBuffer | ArrayBufferView | string;
  bodyBytes?: ArrayBuffer;
  policy?: string;
  node?: string;
  opts?: {
    policy?: string;
  };
}

declare const $done: (object: DoneObject) => void;
declare const $script: {
  startTime: number;
};

const transformQuantumultXBody = (object: DoneObject): Partial<DoneObject> => {
  if (object.body instanceof ArrayBuffer) {
    return { bodyBytes: object.body, body: undefined };
  }
  if (ArrayBuffer.isView(object.body)) {
    return {
      bodyBytes: object.body.buffer.slice(object.body.byteOffset, object.body.byteOffset + object.body.byteLength),
      body: undefined,
    };
  }
  return { bodyBytes: undefined };
};

const transformQuantumultXStatus = (object: DoneObject): Partial<DoneObject> => {
  if (typeof object.status === 'number') {
    return {
      status: `HTTP/1.1 ${object.status} ${StatusTexts[object.status as keyof typeof StatusTexts]}`,
    };
  }
  if (typeof object.status !== 'string' && object.status !== undefined) {
    throw new TypeError(`${done.name}: 参数类型错误, status 必须为数字或字符串`);
  }
  return {};
};

const handleDoneFactory = (startTime?: number) => {
  return (result: DoneObject) => {
    Console.log('🚩 执行结束!', startTime ? `🕛 ${((Date.now() - startTime) / 1000).toFixed(3)} 秒` : undefined);
    $done(result);
  };
};

/**
 * Complete the script execution
 */
export function done(object: DoneObject = {}): void {
  let startTime = $script?.startTime;
  if ($app === 'Surge') {
    startTime *= 1000;
  }

  const handleDone = handleDoneFactory(startTime);

  switch ($app) {
    case 'Surge':
      if (object.policy) {
        set(object, 'headers.X-Surge-Policy', object.policy);
      }
      handleDone(object);
      break;

    case 'Loon':
      if (object.policy) {
        object.node = object.policy;
      }
      handleDone(object);
      break;

    case 'Stash':
      if (object.policy) {
        set(object, 'headers.X-Stash-Selected-Proxy', encodeURI(object.policy));
      }
      handleDone(object);
      break;

    case 'Egern':
      handleDone(object);
      break;

    case 'Shadowrocket':
      handleDone(object);
      break;

    case 'Quantumult X': {
      const transformedObject = {
        ...pick(object, ['status', 'url', 'headers', 'body', 'bodyBytes']),
        ...transformQuantumultXStatus(object),
        ...transformQuantumultXBody(object),
      };
      if (object.policy) {
        set(transformedObject, 'opts.policy', object.policy);
      }
      handleDone(transformedObject);
      break;
    }
    case 'Node.js':
    default:
      Console.log('🚩 执行结束!');
      process.exit(1);
  }
}
