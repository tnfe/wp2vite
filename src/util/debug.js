const chalk  = require('chalk');
const log = console.log;
let debugSwitch = false;

function switchDebug(debug) {
  debugSwitch = debug;
}

function debugError(type, msg) {
  if (!msg) {
    msg = type;
    type = 'common';
  }
  debugSwitch && log(chalk.bgBlueBright(`[wp2vite-${type}]:`) + chalk.red(msg));
}

function debugInfo(type, msg) {
  if (!msg) {
    msg = type;
    type = 'common';
  }
  debugSwitch && log(chalk.bgBlueBright(`[wp2vite-${type}]:`) + chalk.green(msg));
}

function debugWarning(type, msg) {
  if (!msg) {
    msg = type;
    type = 'common';
  }
  log(chalk.bgBlueBright(`[wp2vite-${type}]:`) + chalk.yellow(msg));
}

module.exports = {
  switchDebug,
  debugInfo,
  debugError,
  debugWarning,
}
