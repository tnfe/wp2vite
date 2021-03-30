const { debugInfo } = require('../util/debug.js');
const { getVueWebpackConfigJson, getAliasByJsonAlias, getProxyByMock, getConfigPath } = require('../util/fileHelp.js');
const { rewriteJson } = require('../core/doPackageJson.js');
const { doViteConfig } = require('../core/doViteConfig.js');
const { doVueHtml } = require('../core/doHtml.js');

/**
 *
 * @param entry
 * @return {string}
 */
function getEntry(base, entry) {
  debugInfo('entry', `根据webpack的配置获取入口`);
  const cwd = process.cwd();
  let res = "";
  if (Array.isArray(entry) || typeof entry === 'object') {
    for (const key in entry) {
      const value = entry[key];
      if (Array.isArray(value)) {
        for (const val of value) {
          if (val.indexOf('node_modules') === -1) {
            res = val.replace(cwd, '');
            break;
          }
        }
      } else {
        if (value.indexOf('node_modules') === -1) {
          res = value.replace(cwd, '');
          break;
        }
      }
    }
  } else if (typeof entry === 'string') {
    res = entry.replace(cwd, '');
  }
  console.log(res)
  const li = res.split('.');
  res = li.slice(0, li.length - 1).join('.');
  const exts = ['js', 'ts', 'jsx', 'tsx'];
  for (const ext of exts) {
    if (getConfigPath(base , res + '.' + ext)) {
      res += '.' + ext;
      break;
    }
  }
  debugInfo('entry', `入口获取完成，入口为: ${res}`);
  return res;
}

async function doVue(base, config, json, check) {
  debugInfo('start', 'wp2vite认为是Vue项目');
  const imports = {};
  const alias = {};
  const esbuild = {};
  const deps = {};
  const plugins = [];
  const optimizeDeps = {
    serve: {},
    build: {},
  };
  const {isVueCli} = check;
  const rollupOptions = {
    serve: {},
    build: {},
  };

  imports['* as path'] = 'path';
  const proxy = await getProxyByMock(base);// 获取代理文件
  const configJson = await getVueWebpackConfigJson(base, isVueCli);
  const configAlias = getAliasByJsonAlias(base, configJson?.resolve?.alias);
  for (const key in configAlias) {
    alias[key] = configAlias[key]
  }

  console.log(configJson)
  // 获取入口并写入到index.html
  const appIndexJs = getEntry(base, configJson.entry);
  doVueHtml(base, appIndexJs);

  debugInfo("plugin", "react项目插入plugin：@vitejs/plugin-vue");
  imports.vuePlugin = '@vitejs/plugin-vue';
  plugins.push(`vuePlugin(),`)
  deps['@vitejs/plugin-vue'] = '^1.2.0';

  debugInfo("plugin", "为项目插入兼容plugin：@vitejs/plugin-legacy");
  imports.legacyPlugin = '@vitejs/plugin-legacy';
  plugins.push(`legacyPlugin({
    targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54',  'Edge >= 15'],
  }),`);
  deps['@vitejs/plugin-legacy'] = '^1.3.2';

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