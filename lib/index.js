export * from "./app.mjs";
export * from "./argument.mjs";
export * from "./done.mjs";
export * from "./notification.mjs";
export * from "./time.mjs";
export * from "./wait.mjs";

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
