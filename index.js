export * from "./lib/app.mjs";
export * from "./lib/argument.mjs";
export * from "./lib/done.mjs";
export * from "./lib/notification.mjs";
export * from "./lib/time.mjs";
export * from "./lib/wait.mjs";
export * from "./polyfill/Console.mjs";
export * from "./polyfill/fetch.mjs";
export * from "./polyfill/Lodash.mjs";
export * from "./polyfill/StatusTexts.mjs";
export * from "./polyfill/Storage.mjs";
export * from "./getStorage.mjs";

/**
 * 已标准化的 `$argument` 快照。
 * Normalized `$argument` snapshot.
 */
export const $argument = globalThis.$argument ?? {};

/**
 * 兼容别名（建议优先使用 `$argument`）。
 * Backward-compatible alias (prefer `$argument`).
 */
export const argument = $argument;
