const doReact = require('./react.js');
const doVue = require('./vue.js');
const { doViteConfig } = require("../core/doViteConfig.js");
const { rewriteJson } = require("../core/doPackageJson.js");
const { doVueHtml, doReactHtml, doOtherHtml } = require("../core/doHtml.js");
const { debugInfo } = require('../util/debug.js');
const { getAliasConfByConfig, checkoutTJSConfig, getWebpackConfigJson, getEntries } = require('../util/fileHelp.js')

const imports = {};
const alias = {};
const esbuild = {};
const deps = {};
const proxy = {};
const plugins = [];
const optimizeDeps = {
  serve: {},
  build: {},
};
const rollupOptions = {
  serve: {},
  build: {},
};

const insertHtml = (base, entry, checkedResult) => {
  // 获取入口并写入到index.html
  const entries = getEntries(base, entry);
  if (checkedResult.isReact) {
    doReactHtml(base, entries);
  } else if (checkedResult.isVue) {
    doVueHtml(base, entries);
  } else {
    doOtherHtml(base, entries);
  }
}


const insertLegacy = () => {
  imports.legacyPlugin = '@vitejs/plugin-legacy';
  plugins.push(`legacyPlugin({
    targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54',  'Edge >= 15'],
  }),`);
  deps['@vitejs/plugin-legacy'] = '^1.3.2';
}


async function doOther(base, config, json, checkedResult) {
  debugInfo('start', 'wp2vite认为是react项目');

  debugInfo('start', '正在获取各种配置文件');
  const configJson = getWebpackConfigJson(base, false, false, config);
  const { hasTsConfig, hasJsConfig } = checkoutTJSConfig(base);
  if (hasTsConfig || hasJsConfig) {
    const aliasConf = await getAliasConfByConfig(base, hasTsConfig);
    if (aliasConf) {
      imports['* as path'] = 'path';
      for (const key in aliasConf) {
        alias[key] = aliasConf[key];
      }
    }
  }

  if (checkedResult.isReact) {
    await doReact(base, json, config, {
      ...checkedResult,
    });
    return;
  } else if (checkedResult.isVue) {
    await doVue(base, json, config, {
      ...checkedResult,
    });
    return;
  }

  insertHtml(base, configJson.entry, checkedResult);
  insertLegacy();
  await rewriteJson(base, json, deps);

  // 写vite.config.js
  doViteConfig(base, {
    imports,
    alias,
    proxy,
    plugins,
    esbuild,
    optimizeDeps,
    rollupOptions,
  });
  debugInfo('万事俱备，只欠东风');
  debugInfo(`npm install && npm run vite-start`);
}

module.exports = doOther
