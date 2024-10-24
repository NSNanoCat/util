import { $platform, log } from "./utils.mjs";
export default function logError(error) {
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
