/**
 * 延时等待指定毫秒后继续执行。
 * Wait for the given milliseconds before continuing.
 *
 * @param {number} [delay=1000] 延迟毫秒 / Delay in milliseconds.
 * @returns {Promise<void>}
 */
export function wait(delay = 1000) {
	return new Promise(resolve => setTimeout(resolve, delay));
}
