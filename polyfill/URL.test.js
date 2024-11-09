import URL from "./URL.mjs";

(global => {
	// Overwrite URL if no searchParams property exists.
	global.URL = URL;
})(typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : this);
const url = new URL("https://anonymous:flabada@developer.mozilla.org:8080/zh-CN/docs/Web/API/URL/password?fr=yset_ie_syc_oracle&type=orcl_hpset#page0");
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
