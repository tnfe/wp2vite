const path = require('path');
const resolve = require('resolve');
const writeJsonFile = require('write-json-file');
const { getParams } = require('../util/env.js');
const { checkoutTJSConfig } = require('../util/file.js');

/**
 * 处理tsconfig/jsconfig 的target
 * @return {Promise<void>}
 */
const doConfigJson = async () => {
  const { base } = getParams();
  const { hasTsConfig, hasJsConfig } = checkoutTJSConfig(base);

  if (hasTsConfig || hasJsConfig) {
    const file = path.join(base, hasTsConfig ? '/tsconfig.json' : '/jsconfig.json');
    let json;
    if (hasTsConfig) {
      const ts = require(resolve.sync('typescript', {
        basedir: path.join(base, '/node_modules'),
      }));
      json = ts.readConfigFile(file, ts.sys.readFile).config;
    } else {
      json = require(file);
    }

    // 把tsconfig.json里面的compilerOptions.target 更改为esnext
    if (!json || !json.compilerOptions || !json.compilerOptions.target !== 'esnext') {
      if (!json.compilerOptions) {
        json.compilerOptions = {};
      }
      json.compilerOptions.target = 'esnext';
      await writeJsonFile(file, json);
    }
  }
};

module.exports = {
  doConfigJson,
};


