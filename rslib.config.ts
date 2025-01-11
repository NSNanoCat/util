import { defineConfig } from '@rslib/core';
import path from 'node:path';
import fs from 'node:fs';
import { wait } from './src/lib/wait';

export default defineConfig({
  lib: [
    { format: 'esm', syntax: 'es2021', bundle: false, dts: true },
  ],
  source: {
    entry: {
      index: ['./src/**', '!./src/**/*.d.ts', '!./src/**/*.mjs'],
    },
  },
  output: {
    copy: [
      {
        from: 'polyfill/*.mjs',
        context: path.join(__dirname, 'src'),
      },
      {
        from: './src/polyfill/*.d.ts',
        to: ({ context, absoluteFilename }) =>
          path
            .relative(context, absoluteFilename || '')
            .replace(/^src\//, '')
            .replace(/\.d\.ts$/, '.d.ts.temp'),
      },
    ],
  },
  plugins: [
    {
      name: 'organize',
      setup: (api) => {
        api.onAfterBuild(async () => {
          await wait(1000);
          const distPath = path.join(__dirname, 'dist');
          await fs.promises.rename(path.join(distPath, 'index.mjs'), path.join(distPath, 'index.js'));
          const tempFileReg = /\.temp$/;
          fs.promises.readdir(path.join(distPath, 'polyfill')).then((files) => {
            files.forEach((file) => {
              if (tempFileReg.test(file)) {
                fs.renameSync(
                  path.join(distPath, 'polyfill', file),
                  path.join(distPath, 'polyfill', file.replace(tempFileReg, '')),
                );
              }
            });
          });
        });
      },
    },
  ],
});
