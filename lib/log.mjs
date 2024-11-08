
/**
 * log
 *
 * @export
 * @param {...object} logs
 * @returns {string}
 */
export function log(...logs) {
	return console.log(logs.join("\n"));
}
