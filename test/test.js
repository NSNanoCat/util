//import { $app, Console, done, fetch, getStorage, gRPC, Lodash as _, notification, Storage, time, wait } from "@nsnanocat/util";
import {
  $app,
  Console,
  Storage,
  Lodash as _,
  done,
  fetch,
  gRPC,
  getStorage,
  notification,
  time,
  wait,
} from '../index.js';
const request = {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'ok',
  }),
  opt: {
    method: 'GET',
  },
  ok: true,
};

done(request);
