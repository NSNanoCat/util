import { $app } from "./app.mjs";
import { Console } from "../polyfill/Console.mjs";

/**
 * 通知内容扩展参数。
 * Extended notification content options.
 *
 * @typedef {object|string|number|boolean} NotificationContent
 * @property {string} [open] 打开链接 / Open URL.
 * @property {string} ["open-url"] 打开链接 (QuanX) / Open URL (QuanX).
 * @property {string} [url] 打开链接 / Open URL.
 * @property {string} [openUrl] 打开链接 (Loon/Shadowrocket) / Open URL (Loon/Shadowrocket).
 * @property {string} [copy] 复制文本 / Copy text.
 * @property {string} ["update-pasteboard"] 复制文本 (QuanX) / Copy text (QuanX).
 * @property {string} [updatePasteboard] 复制文本 / Copy text.
 * @property {string} [media] 媒体 URL 或 Base64 / Media URL or Base64.
 * @property {string} ["media-url"] 媒体 URL / Media URL.
 * @property {string} [mediaUrl] 媒体 URL / Media URL.
 * @property {string} [mime] Base64 媒体 MIME / MIME type for Base64 media.
 * @property {number} ["auto-dismiss"] 自动消失秒数 / Auto dismiss seconds.
 * @property {string} [sound] 提示音 / Notification sound.
 */

/**
 * 发送系统通知并按平台适配参数格式。
 * Send system notification with platform-specific payload mapping.
 *
 * 说明:
 * Notes:
 * - iOS App 平台调用 `$notification.post` 或 `$notify`
 * - iOS app platforms call `$notification.post` or `$notify`
 * - Worker 不支持 iOS 通知接口，仅输出日志
 * - Worker does not support iOS notification APIs; it logs only
 * - Node.js 不支持 iOS 通知接口，仅输出日志
 * - Node.js does not support iOS notification APIs; it logs only
 *
 * @param {string} [title=`ℹ️ ${$app} 通知`] 标题 / Title.
 * @param {string} [subtitle=""] 副标题 / Subtitle.
 * @param {string} [body=""] 内容 / Message body.
 * @param {NotificationContent} [content={}] 扩展参数 / Extended content options.
 * @returns {void}
 */
export function notification(title = `ℹ️ ${$app} 通知`, subtitle = "", body = "", content = {}) {
	const mutableContent = MutableContent(content);
	switch ($app) {
		case "Surge":
		case "Loon":
		case "Stash":
		case "Egern":
		case "Shadowrocket":
		default:
			$notification.post(title, subtitle, body, mutableContent);
			break;
		case "Quantumult X":
			$notify(title, subtitle, body, mutableContent);
			break;
		case "Worker":
		case "Node.js":
			break;
	}
	Console.group("📣 系统通知");
	Console.log(title, subtitle, body, JSON.stringify(mutableContent, null, 2));
	Console.groupEnd();
}

/**
 * 将统一通知参数转换为平台可识别字段。
 * Convert normalized content into platform-recognized fields.
 *
 * @private
 * @param {NotificationContent} content 通知扩展参数 / Extended content options.
 * @returns {Record<string, any>}
 */
const MutableContent = content => {
	const mutableContent = {};
	switch (typeof content) {
		case undefined:
			break;
		case "string":
		case "number":
		case "boolean":
			switch ($app) {
				case "Surge":
				case "Stash":
				case "Egern":
				default:
					mutableContent.url = content;
					break;
				case "Loon":
				case "Shadowrocket":
					mutableContent.openUrl = content;
					break;
				case "Quantumult X":
					mutableContent["open-url"] = content;
					break;
				case "Worker":
				case "Node.js":
					break;
			}
			break;
		case "object": {
			const openUrl = content.open || content["open-url"] || content.url || content.openUrl;
			const copyUrl = content.copy || content["update-pasteboard"] || content.updatePasteboard;
			const mediaUrl = content.media || content["media-url"] || content.mediaUrl;
			switch ($app) {
				case "Surge":
				case "Stash":
				case "Egern":
				case "Shadowrocket":
				default: {
					if (openUrl) {
						mutableContent.action = "open-url";
						mutableContent.url = openUrl;
					}
					if (copyUrl) {
						mutableContent.action = "clipboard";
						mutableContent.text = copyUrl;
					}
					if (mediaUrl) {
						switch (true) {
							case mediaUrl.startsWith("http"): // http 开头的网络地址
								mutableContent["media-url"] = mediaUrl;
								break;
							case mediaUrl.startsWith("data:"): {
								// data 开头的 Base64 编码
								// data:image/png;base64,iVBORw0KGgo...
								const base64RegExp = /^data:(?<MIME>\w+\/\w+);base64,(?<Base64>.+)/;
								const { MIME, Base64 } = mediaUrl.match(base64RegExp).groups;
								mutableContent["media-base64"] = Base64;
								mutableContent["media-base64-mime"] = content.mime || MIME;
								break;
							}
							default: {
								mutableContent["media-base64"] = mediaUrl;
								// https://stackoverflow.com/questions/57976898/how-to-get-mime-type-from-base-64-string
								switch (true) {
									case mediaUrl.startsWith("CiVQREYt"):
									case mediaUrl.startsWith("JVBERi0"):
										mutableContent["media-base64-mime"] = "application/pdf";
										break;
									case mediaUrl.startsWith("R0lGODdh"):
									case mediaUrl.startsWith("R0lGODlh"):
										mutableContent["media-base64-mime"] = "image/gif";
										break;
									case mediaUrl.startsWith("iVBORw0KGgo"):
										mutableContent["media-base64-mime"] = "image/png";
										break;
									case mediaUrl.startsWith("/9j/"):
										mutableContent["media-base64-mime"] = "image/jpg";
										break;
									case mediaUrl.startsWith("Qk02U"):
										mutableContent["media-base64-mime"] = "image/bmp";
										break;
								}
								break;
							}
						}
					}
					if (content["auto-dismiss"]) mutableContent["auto-dismiss"] = content["auto-dismiss"];
					if (content.sound) mutableContent.sound = content.sound;
					break;
				}
				case "Loon": {
					if (openUrl) mutableContent.openUrl = openUrl;
					if (mediaUrl?.startsWith("http")) mutableContent.mediaUrl = mediaUrl;
					break;
				}
				case "Quantumult X": {
					if (openUrl) mutableContent["open-url"] = openUrl;
					if (mediaUrl?.startsWith("http")) mutableContent["media-url"] = mediaUrl;
					if (copyUrl) mutableContent["update-pasteboard"] = copyUrl;
					break;
				}
				case "Worker":
				case "Node.js":
					break;
			}
			break;
		}
		default:
			Console.error(`不支持的通知参数类型: ${typeof content}`, "");
			break;
	}
	return mutableContent;
};
