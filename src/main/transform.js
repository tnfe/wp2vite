const { getReactProxyByMock } = require("../util/proxy.js");
const { getEnv } = require('../util/env.js');
const { getWebpackConfig, getDefinePluginConfig, getVueConfig } = require("../util/webpack.js");
const { debugError, debugInfo } = require('../util/debug.js');
const { getConfigAlias, getEntries } = require('../util/file.js');

const { doConfigJson } = require("../core/configJson.js");
const { doViteConfig } = require('../core/viteConfig.js');
const { doPackageJson } = require('../core/package.js');
const { doReactHtml, doOtherHtml, doVueHtml } = require('../core/html.js');

let env;
let deps;
let webpackConfigJson;
let vueConfigJson;

const viteConfig = {
  imports: {},
  alias: {},
  esBuild: {},
  define: [],
  plugins: [],
  proxy: false,
  optimizeDeps: {
    serve: {},
    build: {},
  },
  rollupOptions: {
    serve: {},
    build: {},
  },
};

const devDeps = {};

/**
 * 增加import
 * @param key
 * @param value
 */
const addImport = (key, value) => {
  viteConfig.imports[key] = value;
};

/**
 * 增加依赖
 * @param key
 * @param value
 */
const addDevDeps = (key, value) => {
  devDeps[key] = value;
};

/**
 * do react项目
 * @return {Promise}
 */
const doReact = async () => {
  if (!env.isReact) {
    return;
  }
  const entries = getEntries(webpackConfigJson);
  doReactHtml(entries);
  if (env.isReactAppRewired && webpackConfigJson.devServer && webpackConfigJson.devServer.proxy) {
    viteConfig.proxy = webpackConfigJson.devServer.proxy;
  } else {
    viteConfig.proxy = await getReactProxyByMock();
  }

  const isJsPro = entries.some((item) => /\.js$/.test(item));
  if (isJsPro) {
    addImport('vitePluginReactJsSupport', 'vite-plugin-react-js-support');
    addDevDeps('vite-plugin-react-js-support', 'latest');
    viteConfig.plugins.push(`vitePluginReactJsSupport([], { jsxInject: ${env.isReactMoreThan17 ? true : false}, }),`);
    viteConfig.optimizeDeps.serve.entries = false;
    viteConfig.rollupOptions.serve.input = '[]';
  }

  // 增加vite-plugin-svgr的支持
  if (deps['raw-loader'] || deps['svg-inline-loader']) {
    addImport('svgr', 'vite-plugin-svgr');
    addDevDeps('vite-plugin-svgr', '^0.3.0');
    viteConfig.plugins.push(`svgr(),`);
  }

  viteConfig.define.push(`'process.env.APP_IS_LOCAL': command === 'serve' ? '"true"' : '"false"'`);
  viteConfig.define.push(`'process.env.REACT_APP_IS_LOCAL': command === 'serve' ? '"true"' : '"false"'`);
  addImport('reactRefresh', '@vitejs/plugin-react-refresh');
  addDevDeps('@vitejs/plugin-react-refresh', '^1.3.5');
  viteConfig.plugins.push(`reactRefresh(),`);
};

/**
 * do vue项目
 */
const doVue = () => {
  if (!env.isVue) {
    return;
  }
  const entries = getEntries(webpackConfigJson);
  doVueHtml(entries);
  vueConfigJson = getVueConfig();
  viteConfig.proxy = vueConfigJson?.devServer?.proxy;

  if (env.isVue2) {
    addDevDeps('vite-plugin-vue2', 'latest');
    addImport('{ createVuePlugin }', 'vite-plugin-vue2');
    viteConfig.plugins.unshift('createVuePlugin(),');
  } else if (env.isVue3) {
    addDevDeps('@vitejs/plugin-vue', 'latest');
    addImport('vuePlugin', '@vitejs/plugin-vue');
    viteConfig.plugins.push('vuePlugin(),');
    addDevDeps('@vue/compiler-sfc', '^3.1.5');
  }

  if (deps['raw-loader'] || deps['svg-inline-loader']) {
    addImport('svgLoader', 'vite-svg-loader');
    addDevDeps('vite-svg-loader', '^2.1.0');
    viteConfig.plugins.push(`svgLoader(),`);
  }

  viteConfig.define.push(`'process.env.NODE_ENV': command === 'serve' ? '"development"' : '"production"'`);
};

/**
 * do common
 */
const doCommon = () => {
  addDevDeps('vite', '2');
  // 插入legacy
  addImport('legacyPlugin', '@vitejs/plugin-legacy');
  addDevDeps('@vitejs/plugin-legacy', '^1.4.4');
  viteConfig.plugins.push(`legacyPlugin({
    targets: ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54',  'Edge >= 15'],
  }),`);

  if(deps['babel-plugin-import']) {
    addImport('usePluginImport', 'vite-plugin-importer');
    addDevDeps('vite-plugin-importer', '^0.2.5');
    viteConfig.plugins.push(`usePluginImport({
      libraryName: " ", // todo please input your babel-plugin-import config
      libraryDirectory: " ",
      style: "css",
    }),`);
  }

  if (deps['mockjs']) {
    addImport('{ viteMockServe }', 'vite-plugin-mock');
    addDevDeps('vite-plugin-mock', '2');
    viteConfig.plugins.push(`viteMockServe({
      mockPath: 'mock',
      localEnabled: command === 'serve',
    }),`);
  }

  if (webpackConfigJson.externals && Object.keys(webpackConfigJson.externals).length !== 0) {
    addImport('{ viteExternalsPlugin }', 'vite-plugin-externals');
    addDevDeps('vite-plugin-externals', '^0.1.5');
    viteConfig.plugins.push(`viteExternalsPlugin(${JSON.stringify(webpackConfigJson.externals)}),`);
  }

  if (!env.isReact && !env.isVue) {
    const entries = getEntries(webpackConfigJson);
    doOtherHtml(entries);
  }
  // tsconfig.js or jsconfig.json
  const aliasConf = getConfigAlias(webpackConfigJson);
  if (aliasConf) {
    addImport('* as path', 'path');
    for (const key in aliasConf) {
      viteConfig.alias[key] = aliasConf[key];
    }
  }
};

/**
 * 获取项目类型
 * @return {string}
 */
const getProType = () => {
  if (env.isReact) {
    return env.isReactMoreThan17 ? 'React 17' : 'React 16';
  } else {
    return env.isVue2 ? 'Vue2' : 'Vue3';
  }
};

/**
 * transform main
 * @return {Promise}
 */
const transform = async () => {
  debugInfo('start', '开始转换项目');
  try {
    env = getEnv();
    deps = {
      ...env.packageJson['dependencies'],
      ...env.packageJson['devDependencies'],
    };
    debugInfo('start', `wp2vite 认为是*${getProType()}*项目`);
    webpackConfigJson = getWebpackConfig();
    doCommon();

    // 分析
    await doReact();
    doVue();

    const defines = getDefinePluginConfig();
    viteConfig.define.push(...defines);
    // 写入
    doViteConfig(viteConfig);
    await doPackageJson(devDeps);
    await doConfigJson();

    debugInfo('start', '项目转换完成');
  } catch (error) {
    debugError('start', 'trans 失败');
    debugError('start', error);
  }
};

module.exports = {
  transform,
};
