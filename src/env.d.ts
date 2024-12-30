interface Environment {
  "loon-version"?: string;
  'surge-version'?: string;
  'stash-version'?: string;
}

// biome-ignore lint/suspicious/useNamespaceKeyword: This is a global declaration file
declare module globalThis {
  // biome-ignore lint/style/noVar: This is a global declaration file
  var $environment: Environment
}