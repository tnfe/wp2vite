const { debugInfo } = require('../util/debug.js');
const { getVueWebpackConfigJson, getAliasByJsonAlias, getVueConfigJson, getConfigPath, getEntries } = require('../util/fileHelp.js');
const { rewriteJson } = require('../core/doPackageJson.js');
const { doViteConfig } = require('../core/doViteConfig.js');
const { doVueHtml } = require('../core/doHtml.js');
const { webpackPath } = require('../const.js');

function getProxyFromVueConfig(proxy) {
  if (!proxy) {
    return null;
  }
  return proxy;
}

async function doVue(base, json, check) {
  debugInfo('start', 'wp2vite认为是Vue项目');
  const imports = {};
  const alias = {};
  const esbuild = {};
  const deps = {};
  const plugins = [];
  let proxy = false;
  const optimizeDeps = {
    serve: {},
    build: {},
  };
  const rollupOptions = {
    serve: {},
    build: {},
  };

  imports['* as path'] = 'path';
  const hasVueConfig = getConfigPath(base, webpackPath.vue);
  if (hasVueConfig) {
    const vueConfigJson = getVueConfigJson(base);
    proxy = getProxyFromVueConfig(vueConfigJson?.devServer?.proxy);
  }
  const configJson = getVueWebpackConfigJson(base);

  const configAlias = getAliasByJsonAlias(base, configJson?.resolve?.alias);
  for (const key in configAlias) {
    alias[key] = configAlias[key]
  }

  // 获取入口并写入到index.html
  const entries = getEntries(base, configJson.entry);
  doVueHtml(base, entries);

  const vuePlugin = check.isVue2 ? 'vite-plugin-vue2' : '@vitejs/plugin-vue';

  debugInfo("plugin", `vue目插入plugin：${vuePlugin}`);
  imports.vuePlugin = vuePlugin;
  plugins.push(`vuePlugin(),`)
  deps[vuePlugin] = 'latest';

  debugInfo("plugin", "为项目插入兼容plugin：@vitejs/plugin-legacy");
  imports.legacyPlugin = '@vitejs/plugin-legacy';
  plugins.push(`legacyPlugin({
    targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54',  'Edge >= 15'],
  }),`);
  deps['@vitejs/plugin-legacy'] = '^1.3.2';
  if (!check.isVue2) {
    // 插入vue-sfc的依赖
    deps['@vue/compiler-sfc'] = '^3.0.5';
  }

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
  debugInfo(`npm install && npm run vite-start`);
}

module.exports = doVue