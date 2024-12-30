import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    { format: 'esm', syntax: 'es2021', bundle: false, dts: true },
    { format: 'cjs', syntax: 'es2021', bundle: false },
  ],
  source: {
    entry: {
      index: './src/**',
    },
    transformImport: [
      {
        libraryName: 'lodash',
        customName: 'lodash/{{ member }}',
      },
    ],
  },
});
