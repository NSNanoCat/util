/**
 * wait
 *
 * @export
 * @param {number} [delay=1000]
 * @returns {Promise<resolve>}
 */
export function wait(delay = 1000) {
	return new Promise(resolve => setTimeout(resolve, delay));
}
