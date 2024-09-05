import { $platform } from "./platform.mjs";
import URL from "./URL.mjs";
import _ from "./Lodash.mjs";
import Storage from "./Storage.mjs";
import fetch from "./fetch.mjs";
import notification from "./notification.mjs";
export const log = (...logs) => console.log(logs.join("\n"));
import logError from "./logError.mjs";
export const wait = (delay = 1000) => new Promise(resolve => setTimeout(resolve, delay));
import done from "./done.mjs";
export const getScript = async (url) => await fetch(url).then(response => response.body);
import runScript from "./runScript.mjs";
export { $platform, URL, _, Storage, fetch, notification, logError, done, runScript };