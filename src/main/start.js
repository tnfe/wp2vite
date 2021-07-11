const doReact = require('./react.js');
const doVue = require('./vue.js');
const doOther = require('./other.js');

const { getPackageJson, getConfigPath } = require('../util/fileHelp.js');
const { checkJson } = require('../util/check.js');
const { debugError } = require('../util/debug.js');

async function start({ config, base }) {
  if(getConfigPath(base, 'vite.config.js')) {
    debugError('error', '已经是vite项目了，将覆盖原有配置进行重新生成配置');
  }
  const json = await getPackageJson(base);
  const checkedResult = checkJson(json);
  try {
    if (!checkedResult.isWebpack) {
      throw new Error("it isn't a webpack project ");
    } else if (checkedResult.isReact && (checkedResult.isReactAppRewired || checkedResult.isReactCreateApp)) {
      await doReact(base, json, false, {
        ...checkedResult,
      });
    } else if (checkedResult.isVue && checkedResult.isVueCli) {
      await doVue(base, json, false, {
        ...checkedResult,
      });
    } else if (config) {
      await doOther(base, config, json, {
        ...checkedResult,
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
