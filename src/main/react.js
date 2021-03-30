const fs = require('fs');
const { getAliasByJsonAlias, getProxyByMock, getAliasConfByConfig, checkoutTJSConfig, getWebpackConfigJson } = require('../util/fileHelp.js')
const { doCraHtml } = require('../core/doHtml.js');
const { doViteConfig } = require('../core/doViteConfig.js');
const { rewriteJson } = require('../core/doPackageJson.js');
const { debugInfo } = require('../util/debug.js')
/**
 *
 * @param entry
 * @return {string}
 */
function getEntry(base, entry) {
  const cwd = process.cwd();
  let res = "";
  if (Array.isArray(entry) || typeof entry === 'object') {
    for (const key in entry) {
      const value = entry[key]
      if (value.indexOf('node_modules') === -1) {
        res = value.replace(cwd, '');
        break;
      }
    }
  } else if (typeof entry === 'string') {
    res = entry.replace(cwd, '');
  }
  const li = res.split('.');
  res = li.slice(0, li.length - 1).join('.');
  const exts = ['js', 'ts', 'jsx', 'tsx'];
  for (const ext of exts) {
    if (fs.existsSync(base + res + '.' + ext)) {
      res += '.' + ext;
      break;
    }
  }
  return res;
}

async function doReact(base, config, json, check) {

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
  debugInfo('正在获取各种配置文件');

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
  debugInfo("正在处理逻辑")
  // 获取入口并写入到index.html
  const appIndexJs = getEntry(base, configJson.entry);
  doCraHtml(base, appIndexJs);

  // 入口为js结尾的项目
  const isJsPro = /\.js$/.test(appIndexJs);
  if (isJsPro) {
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

  imports.reactRefresh = '@vitejs/plugin-react-refresh';
  plugins.push(`reactRefresh(),`)
  deps['@vitejs/plugin-react-refresh'] = '^1.3.1';

  imports.legacyPlugin = '@vitejs/plugin-legacy';
  plugins.push(`legacyPlugin({
    targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54',  'Edge >= 15'],
  }),`);
  deps['@vitejs/plugin-legacy'] = '^1.3.2';

  debugInfo("开始整理并写入文件");
  // 写json
  await rewriteJson(base, json, deps);

  // 写vie.config.js
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
  debugInfo(`npm install && npm run vite-dev`);
}

module.exports = doReact