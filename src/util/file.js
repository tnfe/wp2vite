const fs = require('fs');
const path = require('path');
const resolve = require('resolve');
const { debugInfo } = require('./debug.js');
const { getParams } = require('./env.js');

/**
 * 判断项目是否有jsconfig、tsconfig
 * @param base
 * @return {{hasTsConfig: boolean, hasJsConfig: boolean}}
 */
const checkoutTJSConfig = (base) => {
  const hasTsConfig = fs.existsSync(path.resolve(base, './tsconfig.json'));
  const hasJsConfig = fs.existsSync(path.resolve(base, './jsconfig.json'));
  return {
    hasTsConfig,
    hasJsConfig,
  };
};

/**
 * 根据tsconfig.json或者jsconfig.json来获取alias
 * @param base
 * @param hasTsConfig
 * @return alias
 */
const getAliasConfByConfig = (base, hasTsConfig) => {
  debugInfo('alias', `根据config.json获取别名`);
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
  if (json && json.compilerOptions && json.compilerOptions.baseUrl) {
    debugInfo('alias', `项目的baseUrl为:${json.compilerOptions.baseUrl}`);
    const alias = {};
    const src = json.compilerOptions.baseUrl;
    if (src !== './') {
      const files = fs.readdirSync(path.join(base, `/${src}`));
      files.forEach(function(item, index) {
        const stat = fs.statSync(path.join(base, `/${src}/${item}`));
        if (stat.isDirectory() === true) {
          alias[item] = `path.resolve(__dirname, '${src}/${item}')`;
        }
      });
      return alias;
    }
  }
  debugInfo('alias', `别名获取完成`);
  return {};
};

/**
 * 从webpack配置的alias里面导出alias
 * @param base
 * @param alias
 * @return {{}|null}
 */
const getAliasByWebpackAlias = (base, alias) => {
  debugInfo("alias", "根据webpack配置文件处理alias");
  if (!alias) {
    return null;
  }
  const res = {};
  for (const key in alias) {
    const value = alias[key];
    if (value.indexOf(base) !== -1) {
      const src = alias[key].replace(base, '');
      res[key] = `path.resolve(__dirname, '.${src}')`;
    } else {
      res[key] = `'${value}'`;
    }
  }
  debugInfo("alias", "处理alias完成");
  return res;
};

/**
 * 收集alias
 * @param webpackConfigJson
 * @return {Promise<{}>}
 */
const getConfigAlias = (webpackConfigJson) => {
  const { base } = getParams();
  const { hasTsConfig, hasJsConfig } = checkoutTJSConfig(base);
  let configAlias = {};
  if (hasTsConfig || hasJsConfig) {
    configAlias = getAliasConfByConfig(base, hasTsConfig);
  }
  const alias = getAliasByWebpackAlias(base, webpackConfigJson?.resolve?.alias);
  return {
    ...configAlias,
    ...alias,
  };
};

/**
 * 获取react项目的对应的webpack的entries
 * @param webpackConfigJson
 * @return {[]}
 */
const getReactEntries = (webpackConfigJson) => {
  debugInfo('entry', `根据webpack的配置获取入口`);
  const entries = webpackConfigJson.entry;
  const cwd = process.cwd();
  const res = [];

  if (Array.isArray(entries) || typeof entries === 'object') {
    for (const key in entries) {
      const entry = entries[key];
      if (Array.isArray(entry)) {
        for (const val of entry) {
          if (val.indexOf('node_modules') === -1) {
            res.push(val.replace(cwd, ''));
          }
        }
      } else {
        if (entry.indexOf('node_modules') === -1) {
          res.push(entry.replace(cwd, ''));
        }
      }
    }
  } else if (typeof entries === 'string') {
    res.push(entries.replace(cwd, ''));
  }

  debugInfo('entry', `入口获取完成，入口为: ${res}`);
  return res;
};


module.exports = {
  checkoutTJSConfig,
  getConfigAlias,
  getEntries: getReactEntries,
};
