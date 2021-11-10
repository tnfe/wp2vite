const chalk  = require('chalk');
const log = console.log;
let debugSwitch = false;

/**
 * debug开关，默认不开启
 * @param debug boolean
 */
const switchDebug = (debug) => {
  debugSwitch = debug;
};

/**
 * debug 错误信息
 * @param type 类型
 * @param msg 信息
 */
const debugError = (type, msg) => {
  if (!msg) {
    msg = type;
    type = 'common';
  }
  debugSwitch && log(chalk.bgBlueBright(`[wp2vite-${type}]:`) + chalk.red(msg));
};

/**
 * debug 信息
 * @param type 类型
 * @param msg 信息
 */
const debugInfo = (type, msg) => {
  if (!msg) {
    msg = type;
    type = 'common';
  }
  debugSwitch && log(chalk.bgBlueBright(`[wp2vite-${type}]:`) + chalk.green(msg));
};

/**
 * debug warning信息
 * @param type 类型
 * @param msg 信息
 */
const debugWarning = (type, msg) => {
  if (!msg) {
    msg = type;
    type = 'common';
  }
  log(chalk.bgBlueBright(`[wp2vite-${type}]:`) + chalk.yellow(msg));
};

module.exports = {
  switchDebug,
  debugInfo,
  debugError,
  debugWarning,
};
