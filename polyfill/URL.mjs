import URLSearchParams from "./URLSearchParams.mts";
export default class URL {
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
