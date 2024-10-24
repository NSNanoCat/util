export default function initGotEnv(opts) {
	this.got = this.got ? this.got : require("got");
	this.cktough = this.cktough ? this.cktough : require("tough-cookie");
	this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
	if (opts) {
		opts.headers = opts.headers ? opts.headers : {};
		if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
			opts.cookieJar = this.ckjar;
		}
	}
}
