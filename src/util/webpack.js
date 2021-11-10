const fs = require('fs');
const path = require('path');
const { getEnv, getParams } = require('./env.js');
const { webpackPath } = require('../const.js');
const { debugError } = require('./debug.js');

let webpackConfig = false;
let vueConfig = false;
let env;
let params;

/**
 * 获取配置信息的基础能力
 * @param config
 * @return configJson
 */
const getConfig = (config) => {
  process.env.NODE_ENV = 'development';
  const webpackConfig = require(config);
  let configJson;
  if (typeof webpackConfig === "function") {
    configJson = webpackConfig('development');
  } else {
    configJson = webpackConfig;
  }
  return configJson;
};

/**
 * for react项目
 * @return configJson
 */
const getReactWebpackConfig = () => {
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
        };
      }
      if (overrideConfig.devServer && typeof overrideConfig.devServer === 'function') {
        const mockFunc = function() {
          return function () {};
        };
        const mockFun = function() {};
        const devServer = overrideConfig.devServer(mockFunc)(mockFun);
        configJson = {
          ...configJson,
          devServer
        };
      }
    }
  } else {
    configJson = getConfig(webpackConfigPath);
  }
  return configJson;
};

/**
 * for vue项目
 * @return {Promise<*>}
 */
const getVueWebpackConfig = () => {
  process.env.NODE_ENV = 'development';
  const vueConfigPath = path.resolve(params.base, webpackPath.vueConfig);
  if (fs.existsSync(vueConfigPath)) {
    vueConfig = getConfig(vueConfigPath);
  }
  const vueWebpackPath = path.resolve(params.base, webpackPath.vueWebpack);
  const result = getConfig(vueWebpackPath);
  return result;
};

/**
 * 保存当前项目的webpack的配置信息
 */
const saveWebpackConfig = () => {
  env = getEnv();
  params = getParams();
  if (env.hasConfig) {
    // 传递了config，用其传递的config
    webpackConfig = getConfig(params.config);
  } else if (env.isNeedConfig) {
    // 未传config，并且需要config的话，报错
    debugError('webpack', '未传递webpack配置文件路径');
    process.exit(0);
  } else {
    // 走正常判断逻辑
    if (env.isReact) {
      webpackConfig = getReactWebpackConfig();
    } else if (env.isVue) {
      webpackConfig = getVueWebpackConfig();
    } else {
      // 走兜底逻辑，获取当前路径下面的config.
      const config = path.resolve(params.base, './webpack.config.js');
      if (fs.existsSync(config)) {
        webpackConfig = getConfig(config);
      } else {
        debugError('webpack', '跟目录下未找到webpack.config.js');
        process.exit(0);
      }
    }
  }
};

/**
 * 获取HtmlWebpackPlugin的配置信息
 * @return {boolean|*}
 */
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
};

/**
 * 获取DefinePlugin的配置信息
 * @return []
 */
const getDefinePluginConfig = () => {
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
    return defines;
  } catch (err) {
    debugError('webpack', '获取 DefinePlugin 失败');
    debugError('webpack', err);
  }
};

/**
 * 对外暴露获取webpack配置信息的入口
 * @return {boolean}
 */
const getWebpackConfig = () => {
  if (!webpackConfig) {
    debugError('webpack', 'webpack配置获取失败');
    process.exit(0);
  }
  return webpackConfig;
};

const getVueConfig = () => {
  if (!vueConfig) {
    return false;
  }
  return vueConfig;
};

module.exports = {
  saveWebpackConfig,
  getWebpackConfig,
  getWebpackHtmlPluginConfig,
  getDefinePluginConfig,
  getVueConfig,
};
