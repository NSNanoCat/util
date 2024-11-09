class URLSearchParams {
	constructor(params) {
		this.params = params;
		if (this.params.length > 0) {
			const pairs = this.params.slice(1).split("&");
			pairs.forEach(pair => {
				const parts = pair.split("=", 2);
				this.#params.push(parts[0]);
				this.#values.push(parts[1]);
			});
		}
	}

	// Create 2 seperate arrays for the params and values to make management and lookup easier.
	#params = [];
	#values = [];

	// Update the search property of the URL instance with the new params and values.
	#updateSearchString(params, values) {
		if (params.length === 0) this.params = "";
		else this.params = params.map((param, index) => `${param}=${values[index]}`).join("&");
	}

	// Add a given param with a given value to the end.
	append(name, value) {
		this.#params.push(name);
		this.#values.push(value);
		this.#updateSearchString(this.#params, this.#values);
	}

	// Remove all occurances of a given param
	delete(name) {
		while (this.#params.indexOf(name) > -1) {
			this.#values.splice(this.#params.indexOf(name), 1);
			this.#params.splice(this.#params.indexOf(name), 1);
		}
		this.#updateSearchString(this.#params, this.#values);
	}

	// Return an array to be structured in this way: [[param1, value1], [param2, value2]] to mimic the native method's ES6 iterator.
	entries() {
		return this.#params.map((param, index) => [param, this.#values[index]]);
	}

	// Return the value matched to the first occurance of a given param.
	get(name) {
		return this.#values[this.#params.indexOf(name)];
	}

	// Return all values matched to all occurances of a given param.
	getAll(name) {
		return this.#values.filter((value, index) => this.#params[index] === name);
	}

	// Return a boolean to indicate whether a given param exists.
	has(name) {
		return this.#params.indexOf(name) > -1;
	}

	// Return an array of the param names to mimic the native method's ES6 iterator.
	keys() {
		return this.#params;
	}

	// Set a given param to a given value.
	set(name, value) {
		if (this.#params.indexOf(name) === -1) {
			this.append(name, value); // If the given param doesn't already exist, append it.
		} else {
			let first = true;
			const newValues = [];

			// If the param already exists, change the value of the first occurance and remove any remaining occurances.
			this.#params = this.#params.filter((currentParam, index) => {
				if (currentParam !== name) {
					newValues.push(this.#values[index]);
					return true;
					// If the currentParam matches the one being changed and it's the first one, keep the param and change its value to the given one.
				} else if (first) {
					first = false;
					newValues.push(value);
					return true;
				}
				// If the currentParam matches the one being changed, but it's not the first, remove it.
				return false;
			});
			this.#values = newValues;
			this.#updateSearchString(this.#params, this.#values);
		}
	}

	// Sort all key/value pairs, if any, by their keys then by their values.
	sort() {
		// Call entries to make sorting easier, then rewrite the params and values in the new order.
		const sortedPairs = this.entries().sort();
		this.#params = [];
		this.#values = [];
		sortedPairs.forEach(pair => {
			this.#params.push(pair[0]);
			this.#values.push(pair[1]);
		});
		this.#updateSearchString(this.#params, this.#values);
	}

	// Return the search string without the '?'.
	toString = () => this.params;

	// Return and array of the param values to mimic the native method's ES6 iterator..
	values = () => this.#values;
}

(global => {
	// Overwrite URL if no searchParams property exists.
	global.URL = class URL {
		constructor(url, base) {
			const name = "URL";
			const version = "3.0.1";
			console.log(`\n🔗 ${name} v${version}\n`);

			Object.defineProperties(this, {
				hash: {
					get: () => url.hash,
					set: value => (url.hash = value.length > 0 ? `#${value.match(/^#*(.*)/)[1]}` : ""),
				},
				host: {
					get: () => (this.port.length > 0 ? `${this.hostname}:${this.port}` : this.hostname),
					set: value => {
						const parts = value.split(":", 2);
						this.hostname = parts[0];
						this.port = parts[1];
					},
				},
				hostname: {
					get: () => url.hostname,
					set: value => (url.hostname = encodeURIComponent(value)),
				},
				href: {
					get: () => {
						let value = `${this.protocol}//`;
						if (this.username.length > 0) {
							value += this.username;
							if (this.password.length > 0) value += `:${this.password}`;
							value += "@";
						}
						value += this.host;
						//value += this.hostname;
						//if (this.port.length > 0) value += `:${this.port}`;
						value += this.pathname + this.search + this.hash;
						return value;
					},
					set: value => {
						url = {};

						if (value.startsWith("blob:") || value.startsWith("file:")) value = value.slice(5);

						this.protocol = value;
						value = value.replace(/.*?:\/*/, "");

						const usernameMatch = value.match(/([^:]*).*@/);
						this.username = usernameMatch ? usernameMatch[1] : "";
						value = value.replace(/([^:]*):?(.*@)/, this.#removeUsername);

						const passwordMatch = value.match(/.*(?=@)/);
						this.password = passwordMatch ? passwordMatch[0] : "";
						value = value.replace(/.*@/, "");

						this.hostname = value.match(/[^:/?]*/);

						const portMatch = value.match(/:(\d+)/);
						this.port = portMatch ? portMatch[1] : "";

						const pathnameMatch = value.match(/\/([^?#]*)/);
						this.pathname = pathnameMatch ? pathnameMatch[1] : "";

						const searchMatch = value.match(/\?[^#]*/);
						this.search = searchMatch ? searchMatch[0] : "";

						const hashMatch = value.match(/\#.*/);
						this.hash = hashMatch ? hashMatch[0] : "";
					},
				},
				origin: {
					get: () => `${this.protocol}//${this.host}`,
				},
				password: {
					get: () => url.password,
					set: value => {
						if (this.username.length > 0) url.password = encodeURIComponent(value ?? "");
					},
				},
				pathname: {
					get: () => url.pathname,
					set: value => (url.pathname = `/${value.match(/\/?(.*)/)[1]}`),
				},
				port: {
					get: () => {
						switch (this.protocol) {
							case "ftp:":
								return url.port === "21" ? "" : url.port;
							case "http:":
								return url.port === "80" ? "" : url.port;
							case "https:":
								return url.port === "443" ? "" : url.port;
							default:
								return url.port;
						}
					},
					set: value => {
						if (isNaN(value) || value === "") url.port = "";
						else url.port = Math.min(65535, value).toString();
						return value;
					},
				},
				protocol: {
					get: () => url.protocol,
					set: value => (url.protocol = `${value.match(/[^/:]*/)[0]}:`),
				},
				search: {
					get: () => {
						this.search = this.searchParams.toString();
						return url.search;
					},
					set: value => {
						url.search = value.length > 0 ? `?${value.match(/\??(.*)/)[1]}` : "";
						url.searchParams = new URLSearchParams(url.search);
					},
				},
				searchParams: {
					get: () => url.searchParams ?? new URLSearchParams(url.search),
					set: value => (url.searchParams = value ?? new URLSearchParams("")),
				},
				username: {
					get: () => url.username,
					set: value => (url.username = value ?? ""),
				},
			});

			// If a string is passed for url instead of location or link, then set the
			switch (typeof url) {
				case "string": {
					const urlIsValid = /^(blob:|file:)?[a-zA-z]+:\/\/.*/.test(url);
					const baseIsValid = /^(blob:|file:)?[a-zA-z]+:\/\/.*/.test(base);
					if (urlIsValid) this.href = url;
					// If the url isn't valid, but the base is, then prepend the base to the url.
					else if (baseIsValid) this.href = base + url;
					// If no valid url or base is given, then throw a type error.
					else throw new TypeError('URL string is not valid. If using a relative url, a second argument needs to be passed representing the base URL. Example: new URL("relative/path", "http://www.example.com");');
					break;
				}
				case "object":
					// Copy all of the location or link properties to the new URL instance.
					//url.hash = url.hash;
					//url.hostname = url.hostname;
					//url.password = url.password ? url.password : "";
					//url.pathname = url.pathname;
					//url.port = url.port;
					//url.protocol = url.protocol;
					//url.search = url.search;
					//url.username = url.username ? url.username : "";
					break;
				default:
					throw new TypeError("Invalid argument type.");
			}

			// Use IIFE to capture the URL instance and encapsulate the params instead of finding them each time a searchParam method is called
			//this.searchParams = new URLSearchParams(url.search);
		}

		toString = () => this.href;

		toJSON = () => {
			const url = {
				hash: this.hash,
				host: this.host,
				hostname: this.hostname,
				href: this.href,
				origin: this.origin,
				password: this.password,
				pathname: this.pathname,
				port: this.port,
				protocol: this.protocol,
				search: this.search,
				searchParams: this.searchParams,
				username: this.username,
			};
			return JSON.stringify(url);
		};

		#removeUsername = (match, username, password) => {
			if (password === "@") return "";
			else return password;
		};
	};
})(typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : this);
const url = new URL("blob:https://anonymous:flabada@developer.mozilla.org:8080/zh-CN/docs/Web/API/URL/password?fr=yset_ie_syc_oracle&type=orcl_hpset#page0");
console.log(`protocol: ${url.protocol}`);
console.log(`username: ${url.username}`);
console.log(`password: ${url.password}`);
console.log(`host: ${url.host}`);
console.log(`port: ${url.port}`);
console.log(`hostname: ${url.hostname}`);
console.log(`pathname: ${url.pathname}`);
console.log(`search: ${url.search}`);
console.log(`href: ${url.href}`);
console.log(`origin: ${url.origin}`);
console.log(`hash: ${url.hash}`);
for (const [key, value] of url.searchParams.entries()) console.log(`key: ${key}, value: ${value}`);
console.log(`searchParams.get("type"): ${url.searchParams.get("type")}`);
url.searchParams.set("type", "newType");
console.log(`searchParams.get("type"): ${url.searchParams.get("type")}`);
url.searchParams.append("new", "value");
console.log(`search: ${url.search}`);
console.log(url.toString());
console.log(url.toJSON());
$done();
