const fs = require('fs');
const path = require('path');
const { getEnv, getParams } = require('./env.js');
const { webpackPath } = require('../const.js');
const { debugError, debugInfo } = require('./debug.js');

let webpackConfig = false;
let vueConfig = false;
let env;
let params;

const getConfig = async (config) => {
  process.env.NODE_ENV = 'development';
  const webpackConfig = require(config);
  let configJson;
  if (typeof webpackConfig === "function") {
    configJson = webpackConfig('development');
  } else {
    configJson = webpackConfig;
  }
  return configJson;
}

const getReactWebpackConfig = async() => {
  let configFile;
  if (env.isReactAppRewired) {
    configFile = webpackPath.rar;
  } else if (env.reactEject) {
    configFile = webpackPath.craWithEject;
  } else {
    configFile = webpackPath.craNoEject;
  }
  const webpackConfigPath = path.resolve(params.base, configFile);
  // 设置环境变量
  process.env.NODE_ENV = 'development';
  let configJson = {};

  if (env.isReactAppRewired) {
    const overrideConfig = require(webpackConfigPath);
    // let overrideConfig = require(webpackConfigPath);
    const craNoEjectPath = path.resolve(params.base, webpackPath.craNoEject);
    const webpackConfig = require(craNoEjectPath);
    if (typeof overrideConfig === "function") {
      configJson = overrideConfig(webpackConfig('development'), 'development');
    } else {
      if (overrideConfig.webpack && typeof overrideConfig.webpack === 'function') {
        const webpack = overrideConfig.webpack(webpackConfig('development'), 'development');
        configJson = {
          ...webpack
        }
      }
      if (overrideConfig.devServer && typeof overrideConfig.devServer === 'function') {
        const mockFunc = function() {
          return function () {}
        }
        const mockFun = function() {}
        const devServer = overrideConfig.devServer(mockFunc)(mockFun);
        configJson = {
          ...configJson,
          devServer
        }
      }
    }
  } else {
    configJson = await getConfig(webpackConfigPath);
  }
  return configJson;
}

const getVueWebpackConfig = async() => {
  process.env.NODE_ENV = 'development';
  const vueConfigPath = path.resolve(params.base, webpackPath.vueConfig);
  if (fs.existsSync(vueConfigPath)) {
    // const servicePath = path.resolve(params.base, './node_modules/@vue/cli-service/lib/Service.js');
    // console.log(servicePath);
    // const Service = require(servicePath);
    // const service = new Service(params.base);
    // service.init('dev');
    // console.log(service);
    vueConfig = await getConfig(vueConfigPath);
    // todo chainWebpack, configWebpack
    // console.log(vueConfig);
  }
  const vueWebpackPath = path.resolve(params.base, webpackPath.vueWebpack);
  return await getConfig(vueWebpackPath);
}

const saveWebpackConfig = async() => {
  env = await getEnv();
  params = getParams();
  if (env.hasConfig) {
    // 传递了config，用其传递的config
    webpackConfig = await getConfig(params.config);
  } else if (env.isNeedConfig) {
    // 未传config，并且需要config的话，报错
    debugError('webpack', '未传递webpack配置文件路径');
    process.exit(0);
  } else {
    // 走正常判断逻辑
    if (env.isReact) {
      webpackConfig = await getReactWebpackConfig();
    } else if (env.isVue) {
      webpackConfig = await getVueWebpackConfig();
    } else {
      // 走兜底逻辑，获取当前路径下面的config.
      const config = path.resolve(params.base, './webpack.config.js');
      if (fs.existsSync(config)) {
        webpackConfig = await getConfig(config);
      } else {
        debugError('webpack', '跟目录下未找到webpack.config.js');
        process.exit(0);
      }
    }
  }
}

// 获取HtmlWebpackPlugin的配置信息
const getWebpackHtmlPluginConfig = () => {
  if (webpackConfig && Array.isArray(webpackConfig.plugins)) {
    const plugins = webpackConfig.plugins;
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      if (plugin.constructor.name === 'HtmlWebpackPlugin') {
        return plugin.options;
      }
    }
  }
  return false;
}

// 获取DefinePlugin的配置信息
const getDefinePluginConfig = async() => {
  const defines = [];
  try {
    if (webpackConfig && Array.isArray(webpackConfig.plugins)) {
      const plugins = webpackConfig.plugins;
      for (let i = 0; i < plugins.length; i++) {
        const plugin = plugins[i];
        if (plugin.constructor.name === 'DefinePlugin') {
          const { definitions } = plugin;
          for (const definition in definitions) {
            const definitionValue = definitions[definition];
            for (const key in definitionValue) {
              if (key === 'BASE_URL' || key === 'APP_IS_LOCAL' || key === 'REACT_APP_IS_LOCAL') {
                continue;
              }
              const value = definitionValue[key];
              if (value) {
                defines.push(`'${definition}.${key}': '${value}'`);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    debugError('webpack', '获取 DefinePlugin 失败');
    debugError('webpack', err);
  } finally {
    return defines;
  }
}

const getWebpackConfig = () => {
  if (!webpackConfig) {
    debugError('webpack', 'webpack配置获取失败');
    process.exit(0);
  }
  return webpackConfig;
}
const getVueConfig = () => {
  if (!vueConfig) {
    return false;
  }
  return vueConfig;
}

module.exports = {
  saveWebpackConfig,
  getWebpackConfig,
  getWebpackHtmlPluginConfig,
  getDefinePluginConfig,
  getVueConfig,
}
