const fs = require('fs');
const { getConfigPath, getPackageJson, checkEject, checkoutTJSConfig, getAliasConfByConfig } = require('../config.js');
const { doCraHtml } = require('../do/doHtml.js');
const { doViteConfig } = require('../do/doViteConfig.js');
const { webpackPath } = require('../constant.js');
const { checkReactIs17 } = require('../../util')
const {rewriteJson} = require('../do/doPackageJson.js');

function getProxy(base, json) {
  let proxy;
  // todo support json proxy
  if (json.proxy) {
    proxy = {};
  }
  // const setupProxyPath = path.join(base, '/src/setupProxy.js');
  // console.log('setupProxyPath =>>' + setupProxyPath); // /Users/wuhongjie/mywork/new-cra2/src/setupProxy.js
  return proxy;
}

function getWebpackConfigJson(base, hasEject) {
  let configFile = hasEject ? webpackPath.craWithEject : webpackPath.craNoEject;
  // 获取webpack的配置文件地址
  const configPath = getConfigPath(base, configFile);
  // 设置环境变量
  process.env.NODE_ENV = 'development';

  // 获取webpack配置的alias；
  if (!configPath) {
    throw new Error("为获取到webpack.config.js，请用参数输入 --config");
  }
  const webpackConfig = require(configPath);
  let configJson;
  if (typeof webpackConfig === "function") {
    configJson = webpackConfig('development');
  } else {
    configJson = webpackConfig;
  }
  return configJson
}

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

async function doWithCra(base, config) {

  const imports = {};
  const alias = {};
  const esbuild = {};
  const plugins = [];
  const optimizeDeps = {
    serve: {},
    build: {},
  };
  const rollupOptions = {
    serve: {},
    build: {},
  };
  console.log("***************start**********************");
  console.log("正在获取各种配置文件")

  const json = await getPackageJson(base); // 获取项目package.json文件
  const hasEject = checkEject(json); // 判断是否已经进行了eject
  const isReactMoreThan17 = checkReactIs17(json); // 判断是否是17以后版本
  const proxy = getProxy(base, json);// 获取代理文件
  const configJson = getWebpackConfigJson(base, hasEject, config);

  const { hasTsConfig, hasJsConfig } = checkoutTJSConfig(base);
  if (hasTsConfig || hasJsConfig) {
    const aliasConf = await getAliasConfByConfig(base, hasTsConfig, hasJsConfig)
    if (aliasConf) {
      imports['* as path'] = 'path';
      for (const key in aliasConf) {
        alias[key] = aliasConf[key];
      }
    }
  }
  console.log("***************resolve**********************");
  console.log("正在处理逻辑")

  if(isReactMoreThan17) {
    // 插入这个插件
    imports.vitePluginReactJsSupport = 'vite-plugin-react-js-support';
    plugins.push("vitePluginReactJsSupport([], { jsxInject: true, })");
    optimizeDeps.serve.entries = false;
    rollupOptions.serve.output = '[]';
  } else {

  }

  const configAlias = configJson.resolve.alias;
  for (const key in configAlias) {
    alias[key] = `'${configAlias[key]}'`
  }

  // 获取入口并写入到index.html
  const appIndexJs = getEntry(base, configJson.entry);
  doCraHtml(base, appIndexJs);


  console.log("***************write**********************");
  console.log("开始整理并写入文件");
  // 写json
  await rewriteJson(base, json);

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
  console.log("***************end**********************");
  console.log('万事俱备，只欠东风');
  console.log(`cd ${base}`);
  console.log(`npm install`);
}

module.exports = doWithCra