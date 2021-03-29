const chalk  = require('chalk');
const log = console.log;
let debugSwitch = true;

function switchDebug(debug) {
  debugSwitch = debug;
}

function debugError(msg) {
  debugSwitch && log(chalk.red(msg));
}

function debugInfo(msg) {
  debugSwitch && log(chalk.green(msg));
}

function debugWarning(msg) {
  debugSwitch && log(chalk.yellow(msg));
}

module.exports = {
  switchDebug,
  debugInfo,
  debugError,
  debugWarning,
}