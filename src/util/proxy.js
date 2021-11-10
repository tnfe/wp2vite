const fs = require('fs');
const path = require('path');
const loadJsonFile = require('load-json-file');
const { compareVersion } = require("./util.js");
const { debugInfo, debugError } = require("./debug.js");
const { getParams } = require('./env.js');

/**
 * mock http-proxy-middleware来获取项目中配置的代理
 * @return {Promise<{}|boolean>}
 */
const getReactProxyByMock = async () => {
  const { base } = getParams();
  debugInfo('proxy', '开始处理');
  const setupProxyPath = path.join(base, '/src/setupProxy.js');
  if (!fs.existsSync(setupProxyPath)) {
    debugInfo('proxy', '无src/setupProxy.js配置文件，处理结束.');
    return false;
  }
  const middleJson = path.join(base, 'node_modules/http-proxy-middleware/package.json');
  if (!fs.existsSync(middleJson)) {
    debugInfo('proxy', '无http-proxy-middleware模块文件，处理结束.');
    return false;
  }
  try {
    const json = await loadJsonFile(middleJson);
    const middlePath = path.join(`${base}/node_modules/http-proxy-middleware/`, json.main);
    const res = {};
    function mockCreateProxyMiddleware(context, options) {
      res[context] = options;
    }
    if (compareVersion(json.version, '1.0.0')) {
      debugInfo('proxy', `http-proxy-middleware版本大于1，开始mock`);
      const hpm = require(middlePath);
      hpm.createProxyMiddleware = mockCreateProxyMiddleware;
      const setup = require(setupProxyPath);
      setup({ use: () => {}});
      delete require.cache[middlePath];
      debugInfo('proxy', `处理完成，共处理${Object.keys(res).length}个代理.`);
      return res;
    } else {
      debugInfo('proxy', `http-proxy-middleware版本小于1，开始mock`);
      const hpm = mockCreateProxyMiddleware;
      require.cache[middlePath] = {
        exports: hpm,
      };
      const setup = require(setupProxyPath);
      setup({ use: () => {}});
      delete require.cache[middlePath];
      debugInfo('proxy', `处理完成，共处理${Object.keys(res).length}个代理.`);
      return res;
    }
  } catch (err) {
    debugError('proxy', err.message);
  }
};

module.exports = {
  getReactProxyByMock,
};
