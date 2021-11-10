const { transform } = require("./transform.js");
const { saveParams, saveEnv } = require('../util/env.js');
const { saveWebpackConfig } = require('../util/webpack.js');
const { debugError, debugInfo, switchDebug } = require('../util/debug.js');

/**
 * 准备阶段
 * @param base 项目路径
 * @param options
 */
const prepare = async (base, options) => {
  saveParams(base, options);
  await saveEnv();
  saveWebpackConfig();
};

/**
 * 项目转换完毕
 */
const done = () => {
  debugInfo('todo', `npm install && npm run vite-start`);
  debugInfo('todo', `前往 https://github.com/vitejs/awesome-vite 查看你可能需要的插件`);
};

/**
 * 主入口启动函数
 * @param base
 * @param options.config webpack配置文件
 * @param options.debug 是否开启debug
 * @param options.force 是否强制转换 todo
 */
const start = async (base, options) => {
  try {
    switchDebug(options.debug);
    await prepare(base, options);
    await transform();
    done();
  } catch (error) {
    debugError('error', error);
  }
};

module.exports = {
  start,
};
