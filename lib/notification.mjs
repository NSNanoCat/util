import { $platform, log } from ".";
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
 * @param {*} title 标题
 * @param {*} subtitle 副标题
 * @param {*} body 内容
 * @param {*} mutableContent 通知扩展字段
 *
 */
export default function notification(title, subtitle, body, mutableContent) {
	switch ($platform) {
		case "Surge":
		case "Loon":
		case "Stash":
		case "Egern":
		case "Shadowrocket":
		default:
			$notification.post(title, subtitle, body, MutableContent(mutableContent));
			break;
		case "Quantumult X":
			$notify(title, subtitle, body, MutableContent(mutableContent));
			break;
		case "Node.js":
			break;
	}
	log(...["", "==============📣系统通知📣==============", subtitle || "", body || ""]);
}

const MutableContent = content => {
	switch (typeof content) {
		case undefined:
			return content;
		case "string":
			switch ($platform) {
				case "Surge":
				case "Stash":
				case "Egern":
				default:
					return { url: content };
				case "Loon":
				case "Shadowrocket":
					return content;
				case "Quantumult X":
					return { "open-url": content };
				case "Node.js":
					return undefined;
			}
		case "object":
			switch ($platform) {
				case "Surge":
				case "Stash":
				case "Egern":
				case "Shadowrocket":
				default: {
					const openUrl = content.url || content.openUrl || content["open-url"];
					return { url: openUrl };
				}
				case "Loon": {
					const openUrl = content.openUrl || content.url || content["open-url"];
					const mediaUrl = content.mediaUrl || content["media-url"];
					return { openUrl, mediaUrl };
				}
				case "Quantumult X": {
					const openUrl = content["open-url"] || content.url || content.openUrl;
					const mediaUrl = content["media-url"] || content.mediaUrl;
					const updatePasteboard = content["update-pasteboard"] || content.updatePasteboard;
					return {
						"open-url": openUrl,
						"media-url": mediaUrl,
						"update-pasteboard": updatePasteboard,
					};
				}
				case "Node.js":
					return undefined;
			}
		default:
			return undefined;
	}
};
