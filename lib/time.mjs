/**
 * time
 * 时间格式化
 * [version of ISO8601]{@link https://262.ecma-international.org/5.1/#sec-15.9.1.15}
 * 示例:time("yyyy-MM-dd qq HH:mm:ss.S") YYYY-MM-DDTHH:mm:ss.sssZ
 *    :time("yyyyMMddHHmmssS")
 *    YY:年 MM:月 dd:日 S:季 HH:时 m:分 ss:秒 sss:毫秒 Z:时区
 *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
 * @param {string} format 格式化参数
 * @param {number} ts 可选: 根据指定时间戳返回格式化日期
 *
 */
export function time(format, ts) {
	const date = ts ? new Date(ts) : new Date();
	const Time = {
		YY: date.getFullYear().toString().substring(3),
		yyyy: date.getFullYear().toString(),
		MM: (date.getMonth() + 1).toString().padStart(2, "0"),
		dd: date.getDate().toString().padStart(2, "0"),
		HH: date.getHours().toString().padStart(2, "0"),
		mm: date.getMinutes().toString().padStart(2, "0"),
		sss: date.getMilliseconds().toString().padStart(3, "0"),
		ss: date.getSeconds().toString().padStart(2, "0"),
		S: `${Math.floor(date.getMonth() / 3) + 1}`,
	};
	for (const [key, value] of Object.entries(Time)) {
		format = format.replace(key, value);
	}
	return format;
}
