const chalk  = require('chalk');
let debugSwitch = false;

function switchDebug(debug) {
  debugSwitch = debug;
}

function debugError(msg) {
  console.log('error::::' + msg)
  debugSwitch && chalk.red(msg);
}

function debugInfo(msg) {
  console.log('info::::' + msg)
  debugSwitch && chalk.green(msg);
}

function debugWarning(msg) {
  console.log('warning::::' + msg)
  debugSwitch && chalk.yellow(msg);
}

module.exports = {
  switchDebug,
  debugInfo,
  debugError,
  debugWarning,
}