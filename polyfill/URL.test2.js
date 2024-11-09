class URLSearchParams {
    constructor(params) {
        switch (typeof params) {
            case "string": {
                const pairs = params
                    .slice(1)
                    .split("&")
                    .map(pair => pair.split("="));
                pairs.forEach(([key, value]) => {
                    this.#params.push(key);
                    this.#values.push(value);
                });
                break;
            }
            case "object":
                if (Array.isArray(params)) {
                    Object.entries(params).forEach(([key, value]) => {
                        this.#params.push(key);
                        this.#values.push(value);
                    });
                }
                else if (Symbol.iterator in Object(params)) {
                    for (const [key, value] of params) {
                        this.#params.push(key);
                        this.#values.push(value);
                    }
                }
                break;
        }
        this.#updateSearchString(this.#params, this.#values);
    }
    // Create 2 seperate arrays for the params and values to make management and lookup easier.
    #param = "";
    #params = [];
    #values = [];
    // Update the search property of the URL instance with the new params and values.
    #updateSearchString(params, values) {
        if (params.length === 0)
            this.#param = "";
        else
            this.#param = params.map((param, index) => `${param}=${values[index]}`).join("&");
    }
    // Add a given param with a given value to the end.
    append(name, value) {
        this.#params.push(name);
        this.#values.push(value);
        this.#updateSearchString(this.#params, this.#values);
    }
    // Remove all occurances of a given param
    delete(name, value) {
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
    has(name, value) {
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
        }
        else {
            let first = true;
            const newValues = [];
            // If the param already exists, change the value of the first occurance and remove any remaining occurances.
            this.#params = this.#params.filter((currentParam, index) => {
                if (currentParam !== name) {
                    newValues.push(this.#values[index]);
                    return true;
                    // If the currentParam matches the one being changed and it's the first one, keep the param and change its value to the given one.
                }
                else if (first) {
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
    toString = () => (this.#param ? String(this.#param) : "");
    // Return and array of the param values to mimic the native method's ES6 iterator..
    values = () => this.#values.values();
}

(global => {
	// Overwrite URL if no searchParams property exists.
	global.URL = class URL {
		constructor(url, base) {
			const name = "URL";
			const version = "3.1.0";
			console.log(`\n🔗 ${name} v${version}\n`);
			switch (typeof url) {
				case "string": {
					const urlIsValid = /^(blob:|file:)?[a-zA-z]+:\/\/.*/.test(url);
					const baseIsValid = base ? /^(blob:|file:)?[a-zA-z]+:\/\/.*/.test(base) : false;
					// If a string is passed for url instead of location or link, then set the properties of the URL instance.
					if (urlIsValid)
						this.href = url;
					// If the url isn't valid, but the base is, then prepend the base to the url.
					else if (baseIsValid)
						this.href = base + url;
					// If no valid url or base is given, then throw a type error.
					else
						throw new TypeError('URL string is not valid. If using a relative url, a second argument needs to be passed representing the base URL. Example: new URL("relative/path", "http://www.example.com");');
					break;
				}
				case "object":
					break;
				default:
					throw new TypeError("Invalid argument type.");
			}
		}
		#url = {
			hash: "",
			host: "",
			hostname: "",
			href: "",
			password: "",
			pathname: "/",
			port: "",
			protocol: "",
			search: "",
			searchParams: new URLSearchParams(""),
			username: "",
		};
		get hash() {
			return this.#url.hash;
		}
		set hash(value) {
			this.#url.hash = value.length > 0 ? `#${value.match(/^#*(.*)/)[1]}` : "";
		}
		get host() {
			return this.port.length > 0 ? `${this.hostname}:${this.port}` : this.hostname;
		}
		set host(value) {
			const parts = value.split(":", 2);
			this.hostname = parts[0];
			this.port = parts[1];
		}
		get hostname() {
			return this.#url.hostname;
		}
		set hostname(value) {
			this.#url.hostname = encodeURIComponent(value);
		}
		get href() {
			let value = `${this.protocol}//`;
			if (this.username.length > 0) {
				value += this.username;
				if (this.password.length > 0)
					value += `:${this.password}`;
				value += "@";
			}
			value += this.host;
			value += this.pathname + this.search + this.hash;
			return value;
		}
		set href(value) {
			if (value.startsWith("blob:") || value.startsWith("file:"))
				value = value.slice(5);
			this.protocol = value;
			value = value.replace(/.*?:\/*/, "");
			const usernameMatch = value.match(/([^:]*).*@/);
			this.username = usernameMatch ? usernameMatch[1] : "";
			value = value.replace(/([^:]*):?(.*@)/, this.#removeUsername);
			const passwordMatch = value.match(/.*(?=@)/);
			this.password = passwordMatch ? passwordMatch[0] : "";
			value = value.replace(/.*@/, "");
			this.hostname = value.match(/[^:/?]*/)[0];
			const portMatch = value.match(/:(\d+)/);
			this.port = portMatch ? portMatch[1] : "";
			const pathnameMatch = value.match(/\/([^?#]*)/);
			this.pathname = pathnameMatch ? pathnameMatch[1] : "";
			const searchMatch = value.match(/\?[^#]*/);
			this.search = searchMatch ? searchMatch[0] : "";
			const hashMatch = value.match(/\#.*/);
			this.hash = hashMatch ? hashMatch[0] : "";
		}
		get origin() {
			return `${this.protocol}//${this.host}`;
		}
		get password() {
			return this.#url.password;
		}
		set password(value) {
			if (this.username.length > 0)
				this.#url.password = encodeURIComponent(value ?? "");
		}
		get pathname() {
			return this.#url.pathname;
		}
		set pathname(value) {
			this.#url.pathname = `/${value.match(/\/?(.*)/)[1]}`;
		}
		get port() {
			switch (this.protocol) {
				case "ftp:":
					return this.#url.port === "21" ? "" : this.#url.port;
				case "http:":
					return this.#url.port === "80" ? "" : this.#url.port;
				case "https:":
					return this.#url.port === "443" ? "" : this.#url.port;
				default:
					return this.#url.port;
			}
		}
		set port(value) {
			if (isNaN(Number(value)) || value === "")
				this.#url.port = "";
			else
				this.#url.port = Math.min(65535, Number(value)).toString();
		}
		get protocol() {
			return this.#url.protocol;
		}
		set protocol(value) {
			this.#url.protocol = `${value.match(/[^/:]*/)[0]}:`;
		}
		get search() {
			this.search = this.#url.searchParams.toString();
			return this.#url.search;
		}
		set search(value) {
			this.#url.search = value.length > 0 ? `?${value.match(/\??(.*)/)[1]}` : "";
			this.#url.searchParams = new URLSearchParams(this.#url.search);
		}
		get searchParams() {
			return this.#url.searchParams;
		}
		get username() {
			return this.#url.username;
		}
		set username(value) {
			this.#url.username = value ?? "";
		}
		/**
		 * Returns the string representation of the URL.
		 *
		 * @returns {string} The href of the URL.
		 */
		toString = () => this.href;
		/**
		 * Converts the URL object properties to a JSON string.
		 *
		 * @returns {string} A JSON string representation of the URL object.
		 */
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
			if (password === "@")
				return "";
			else
				return password;
		};
	}
	
})(typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : this);
const url = new URL("https://anonymous:flabada@developer.mozilla.org:8080/zh-CN/docs/Web/API/URL/password?fr=yset_ie_syc_oracle&type=orcl_hpset#page0");
console.log(`searchParams: ${url.searchParams.toString()}`);
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
//console.log(`searchParams.get("new"): ${url.searchParams.get("new")}`);
console.log(`search: ${url.search}`);
console.log(url.toString());
console.log(url.toJSON());
$done();
