const chalk  = require('chalk');
let debugSwitch = false;

chalk.green('hello wp2vite');

function switchDebug(debug) {
  debugSwitch = debug;
}

function debugError(msg) {
  debugSwitch && chalk.red(msg);
}

function debugInfo(msg) {
  debugSwitch && chalk.green(msg);
}

function debugWarning(msg) {
  debugSwitch && chalk.yellow(msg);
}

module.exports = {
  switchDebug,
  debugInfo,
  debugError,
  debugWarning,
}