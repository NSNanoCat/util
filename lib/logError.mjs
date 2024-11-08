import { $platform, log } from "./index.js";

/**
 * logError
 *
 * @export
 * @param {string} error
 * @returns {string}
 */
export function logError(error) {
    switch ($platform) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Egern":
        case "Shadowrocket":
        case "Quantumult X":
        default:
            log("", "❗️执行错误!", error, "");
            break
        case "Node.js":
            log("", "❗️执行错误!", error.stack, "");
            break
    };
};
