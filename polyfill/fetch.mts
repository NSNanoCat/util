import { fetch as fetchRuntime } from "./fetch.mjs";
import type { Fetch } from "./fetch.d.ts";

export type { Fetch, FetchRequest, FetchResponse } from "./fetch.d.ts";

export const fetch: Fetch = fetchRuntime as Fetch;
