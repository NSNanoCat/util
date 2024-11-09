import URLSearchParams from "./URLSearchParams.mjs";
export default class URL {
	constructor(url, base) {
		const name = "URL";
		const version = "3.0.2";
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
				get: () => (this.search = this.searchParams.toString()),
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

		switch (typeof url) {
			case "string": {
				const urlIsValid = /^(blob:|file:)?[a-zA-z]+:\/\/.*/.test(url);
				const baseIsValid = /^(blob:|file:)?[a-zA-z]+:\/\/.*/.test(base);
				// If a string is passed for url instead of location or link, then set the properties of the URL instance.
				if (urlIsValid) this.href = url;
				// If the url isn't valid, but the base is, then prepend the base to the url.
				else if (baseIsValid) this.href = base + url;
				// If no valid url or base is given, then throw a type error.
				else throw new TypeError('URL string is not valid. If using a relative url, a second argument needs to be passed representing the base URL. Example: new URL("relative/path", "http://www.example.com");');
				break;
			}
			case "object":
				break;
			default:
				throw new TypeError("Invalid argument type.");
		}
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
}
