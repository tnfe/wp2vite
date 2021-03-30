const doReact = require('./react.js');
const doVue = require('./vue.js');
const doOther = require('./other.js');

const { getPackageJson } = require('../util/fileHelp.js');
const { checkJson } = require('../util/check.js');
const { debugError } = require('../util/debug.js');

async function start({ config, base }) {
  const json = await getPackageJson(base);
  const checkedResult = checkJson(json);
  try {
    if (checkedResult.isReact) {
      await doReact(base, config, json, {
        ...checkedResult
      });
    } else if (checkedResult.isVue) {
      await doVue(base, config, json, {
        ...checkedResult
      });
    } else if (config) {
      await doOther(base, config, json, {
        ...checkedResult
      });
    } else {
      debugError('params', 'unknow config for your project');
    }
  } catch (err) {
    debugError('error', err.message || '出错了');
  }
}

module.exports = {
  start
}