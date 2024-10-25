/* https://www.lodashjs.com */
export class Lodash {
	static get(object = {}, path = "", defaultValue = undefined) {
		// translate array case to dot case, then split with .
		// a[0].b -> a.0.b -> ['a', '0', 'b']
		if (!Array.isArray(path)) path = Lodash.toPath(path);

		const result = path.reduce((previousValue, currentValue) => {
			return Object(previousValue)[currentValue]; // null undefined get attribute will throwError, Object() can return a object
		}, object);
		return result === undefined ? defaultValue : result;
	}

	static set(object, path, value) {
		if (!Array.isArray(path)) path = Lodash.toPath(path);
		path.slice(0, -1).reduce((previousValue, currentValue, currentIndex) => (Object(previousValue[currentValue]) === previousValue[currentValue] ? previousValue[currentValue] : (previousValue[currentValue] = /^\d+$/.test(path[currentIndex + 1]) ? [] : {})), object)[path[path.length - 1]] = value;
		return object;
	}

	static unset(object = {}, path = "") {
		if (!Array.isArray(path)) path = Lodash.toPath(path);
		const result = path.reduce((previousValue, currentValue, currentIndex) => {
			if (currentIndex === path.length - 1) {
				delete previousValue[currentValue];
				return true;
			}
			return Object(previousValue)[currentValue];
		}, object);
		return result;
	}

	static toPath(value) {
		return value
			.replace(/\[(\d+)\]/g, ".$1")
			.split(".")
			.filter(Boolean);
	}

	static escape(string) {
		const map = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return string.replace(/[&<>"']/g, m => map[m]);
	}

	static unescape(string) {
		const map = {
			"&amp;": "&",
			"&lt;": "<",
			"&gt;": ">",
			"&quot;": '"',
			"&#39;": "'",
		};
		return string.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, m => map[m]);
	}
}
