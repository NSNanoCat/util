import { get, escape as lodashEscape, unescape as lodashUnescape, omit, pick, set, toPath, unset } from 'lodash';

export const Lodash = {
  escape: lodashEscape,
  get,
  omit,
  pick,
  set,
  toPath,
  unescape: lodashUnescape,
  unset,
};
