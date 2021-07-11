const fs = require('fs');
const { getAliasByJsonAlias, getProxyByMock, getAliasConfByConfig, checkoutTJSConfig, getWebpackConfigJson, getEntries } = require('../util/fileHelp.js')
const { doReactHtml } = require('../core/doHtml.js');
const { doViteConfig } = require('../core/doViteConfig.js');
const { rewriteJson } = require('../core/doPackageJson.js');
const { debugInfo } = require('../util/debug.js')

async function doReact(base, json, config, check) {

  debugInfo('start', 'wp2vite认为是react项目');
  const imports = {};
  const alias = {};
  const esbuild = {};
  const deps = {};
  const plugins = [];
  const optimizeDeps = {
    serve: {},
    build: {},
  };
  const rollupOptions = {
    serve: {},
    build: {},
  };
  debugInfo('start', '正在获取各种配置文件');

  const { reactEject, isReactAppRewired, isReactMoreThan17 } = check;
  const proxy = await getProxyByMock(base);// 获取代理文件
  const configJson = getWebpackConfigJson(base, isReactAppRewired, reactEject, config);
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
  // 获取入口并写入到index.html
  const entries = getEntries(base, configJson.entry);
  doReactHtml(base, entries);

  // 入口为js结尾的项目
  const isJsPro = entries.some((item) => /\.js$/.test(item));
  if (isJsPro) {
    debugInfo("plugin", "js项目插入plugin：vite-plugin-react-js-support");
    imports.vitePluginReactJsSupport = 'vite-plugin-react-js-support';
    plugins.push(`vitePluginReactJsSupport([], { jsxInject: ${isReactMoreThan17 ? true : false}, }),`);
    deps['vite-plugin-react-js-support'] = 'latest';
    optimizeDeps.serve.entries = false;
    rollupOptions.serve.input = '[]';
  }

  const configAlias = getAliasByJsonAlias(base, configJson?.resolve?.alias);
  for (const key in configAlias) {
    alias[key] = configAlias[key]
  }

  debugInfo("plugin", "react项目插入plugin：@vitejs/plugin-react-refresh");
  imports.reactRefresh = '@vitejs/plugin-react-refresh';
  plugins.push(`reactRefresh(),`)
  deps['@vitejs/plugin-react-refresh'] = '^1.3.1';

  debugInfo("plugin", "为项目插入兼容plugin：@vitejs/plugin-legacy");
  imports.legacyPlugin = '@vitejs/plugin-legacy';
  plugins.push(`legacyPlugin({
    targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54',  'Edge >= 15'],
  }),`);
  deps['@vitejs/plugin-legacy'] = '^1.3.2';

  // 写json
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

module.exports = doReact
