import { fetch as fetchRuntime } from "./fetch.js";
import type { Fetch } from "./fetch.d.ts";

export type { Fetch, FetchRequest, FetchResponse } from "./fetch.d.ts";

export const fetch: Fetch = fetchRuntime as Fetch;
