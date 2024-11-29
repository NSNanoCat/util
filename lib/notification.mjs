import { $app } from "./app.mjs";
import { Console } from "../polyfill/Console.mjs";

/**
 * 系统通知
 *
 * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
 *
 * 示例:
 * $.msg(title, subtitle, body, "twitter://")
 * $.msg(title, subtitle, body, { "open-url": "twitter://", "media-url": "https://github.githubassets.com/images/modules/open_graph/github-mark.png" })
 * $.msg(title, subtitle, body, { "open-url": "https://bing.com", "media-url": "https://github.githubassets.com/images/modules/open_graph/github-mark.png" })
 *
 * @param {string} title 标题
 * @param {string} subtitle 副标题
 * @param {string} body 内容
 * @param {*} mutableContent 通知扩展字段
 *
 */
export function notification(title = `ℹ️ ${$app} 通知`, subtitle = "", body = "", content = {}) {
	switch ($app) {
		case "Surge":
		case "Loon":
		case "Stash":
		case "Egern":
		case "Shadowrocket":
		default:
			$notification.post(title, subtitle, body, MutableContent(content));
			break;
		case "Quantumult X":
			$notify(title, subtitle, body, MutableContent(content));
			break;
		case "Node.js":
			break;
	}
	Console.info(...["==============📣系统通知📣==============", title, subtitle, body, JSON.stringify(MutableContent(content), null, 2)]);
}

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
