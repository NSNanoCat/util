import { Console } from '../polyfill/Console.js';
import { $app } from './app.js';

interface NotificationContent {
  open?: string;
  'open-url'?: string;
  url?: string;
  openUrl?: string;
  copy?: string;
  'update-pasteboard'?: string;
  updatePasteboard?: string;
  media?: string;
  'media-url'?: string;
  mediaUrl?: string;
  'auto-dismiss'?: boolean;
  sound?: string;
  mime?: string;
}

declare const $notify: (title: string, subtitle: string, body: string, content: NotificationContent) => void;
declare const $notification: {
  post: (title: string, subtitle: string, body: string, content: NotificationContent) => void;
};

/**
 * 系统通知
 */
export function notification(
  title = `ℹ️ ${$app} 通知`,
  subtitle = '',
  body = '',
  content: string | number | boolean | NotificationContent = {},
): void {
  const mutableContent = getMutableContent(content);

  switch ($app) {
    case 'Quantumult X':
      $notify(title, subtitle, body, mutableContent);
      break;
    case 'Node.js':
      break;
    default:
      $notification.post(title, subtitle, body, mutableContent);
      break;
  }
  Console.group('📣 系统通知');
  Console.log(title, subtitle, body, JSON.stringify(mutableContent, null, 2));
  Console.groupEnd();
}

function getMutableContent(content: string | number | boolean | NotificationContent): Record<string, any> {
  const mutableContent: Record<string, any> = {};

  switch (typeof content) {
    case 'string':
    case 'number':
    case 'boolean':
      assignSimpleContent(mutableContent, content);
      break;

    case 'object':
      if (content) {
        assignObjectContent(mutableContent, content);
      }
      break;

    default:
      Console.error(`不支持的通知参数类型: ${typeof content}`);
      break;
  }

  return mutableContent;
}

function assignSimpleContent(mutableContent: Record<string, any>, content: string | number | boolean): void {
  switch ($app) {
    case 'Quantumult X':
      mutableContent['open-url'] = content;
      break;
    case 'Loon':
    case 'Shadowrocket':
      mutableContent.openUrl = content;
      break;
    default:
      mutableContent.url = content;
      break;
  }
}

function assignObjectContent(mutableContent: Record<string, any>, content: NotificationContent): void {
  const openUrl = content.open || content['open-url'] || content.url || content.openUrl;
  const copyUrl = content.copy || content['update-pasteboard'] || content.updatePasteboard;
  const mediaUrl = content.media || content['media-url'] || content.mediaUrl;

  switch ($app) {
    case 'Quantumult X':
      if (openUrl) mutableContent['open-url'] = openUrl;
      if (mediaUrl?.startsWith('http')) mutableContent['media-url'] = mediaUrl;
      if (copyUrl) mutableContent['update-pasteboard'] = copyUrl;
      break;

    case 'Loon':
      if (openUrl) mutableContent.openUrl = openUrl;
      if (mediaUrl?.startsWith('http')) mutableContent.mediaUrl = mediaUrl;
      break;

    default:
      if (openUrl) {
        mutableContent.action = 'open-url';
        mutableContent.url = openUrl;
      }
      if (copyUrl) {
        mutableContent.action = 'clipboard';
        mutableContent.text = copyUrl;
      }
      if (mediaUrl) {
        handleMediaContent(mutableContent, mediaUrl, content.mime);
      }
      if (content['auto-dismiss']) mutableContent['auto-dismiss'] = content['auto-dismiss'];
      if (content.sound) mutableContent.sound = content.sound;
      break;
  }
}

function handleMediaContent(mutableContent: Record<string, any>, mediaUrl: string, mime?: string): void {
  if (mediaUrl.startsWith('http')) {
    mutableContent['media-url'] = mediaUrl;
  } else if (mediaUrl.startsWith('data:')) {
    const base64RegExp = /^data:(?<MIME>\w+\/\w+);base64,(?<Base64>.+)/;
    const match = mediaUrl.match(base64RegExp);
    if (match?.groups) {
      mutableContent['media-base64'] = match.groups.Base64;
      mutableContent['media-base64-mime'] = mime || match.groups.MIME;
    }
  } else {
    mutableContent['media-base64'] = mediaUrl;
    mutableContent['media-base64-mime'] = detectMimeType(mediaUrl);
  }
}

function detectMimeType(base64: string): string {
  if (base64.startsWith('JVBERi0')) return 'application/pdf';
  if (base64.startsWith('R0lGODdh') || base64.startsWith('R0lGODlh')) return 'image/gif';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('Qk02U')) return 'image/bmp';
  return 'application/octet-stream';
}
