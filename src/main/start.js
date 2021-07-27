const { transform } = require("./transform.js");
const { saveParams, saveEnv } = require('../util/env.js');
const { saveWebpackConfig } = require('../util/webpack.js');
const { debugError, debugInfo, switchDebug } = require('../util/debug.js');

const prepare = async (base, options) => {
  saveParams(base, options);
  await saveEnv(base);
  await saveWebpackConfig();
}

const done = async () => {
  debugInfo('todo', `npm install && npm run vite-start`);
  debugInfo('todo', `前往 https://github.com/vitejs/awesome-vite 查看你可能需要的插件`);
}

async function start(base, options) {
  try {
    switchDebug(options.debug);
    await prepare(base, options);
    await transform();
    await done();
  } catch (error) {
    debugError('error', error);
  }
}

module.exports = {
  start
}
