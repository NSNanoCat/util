"use strict";

const { fetch } = require("./polyfill/fetch.cjs");
const { Storage } = require("./polyfill/Storage.cjs");

module.exports = {
	fetch,
	Storage,
};
