import fs from 'fs';
import path from 'path';
import { saveParams } from '../src/util/env.js';

import { doOtherHtml, doVueHtml, doReactHtml} from '../src/core/html.js';
import { doPackageJson } from '../src/core/package.js';
import { doViteConfig } from '../src/core/viteConfig.js';
import { doConfigJson } from '../src/core/configJson.js';

const base = path.resolve('./mock');

describe("core test", () => {
  beforeAll(() => {
    saveParams(base, './webpack.config.js');
  });
  test('html instance', () => {
    expect(doOtherHtml).toBeInstanceOf(Function);
    expect(doVueHtml).toBeInstanceOf(Function);
    expect(doReactHtml).toBeInstanceOf(Function);
  });

  test('test doVueHtml', () => {
    doVueHtml([]);
    const configPath = path.resolve(base, './index.html');
    const exist = fs.existsSync(configPath);
    expect(exist).toBeTruthy();
  });

  test('package instance', () => {
    expect(doPackageJson).toBeInstanceOf(Function);
  });
  test('test doPackageJson', async () => {
    await doPackageJson([]);
    const configPath = path.resolve(base, './package.json');
    const exist = fs.existsSync(configPath);
    expect(exist).toBeTruthy();
  });

  test('viteConfig instance', () => {
    expect(doViteConfig).toBeInstanceOf(Function);
  });
  test('test doViteConfig', async () => {
    await doViteConfig({
      imports: {},
      alias: {},
      proxy: {},
      plugins: [],
      define: [],
      esBuild: {},
      optimizeDeps: {},
      rollupOptions: {},
    });
    const configPath = path.resolve(base, './vite.config.js');
    const exist = fs.existsSync(configPath);
    expect(exist).toBeTruthy();
  });

  test('configJson instance', () => {
    expect(doConfigJson).toBeInstanceOf(Function);
  });
  test('test doConfigJson', async () => {
    await doConfigJson();
  });
});
