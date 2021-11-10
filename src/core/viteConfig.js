const beautify = require('js-beautify').js;
const fs = require('fs');
const path = require('path');
const { replacePlace } = require('../const.js');
const { debugInfo } = require('../util/debug.js');
const { getParams } = require('../util/env.js');

const debugKey = 'vite';

const { viteConfig } = require('../template/vite.config.js')

/**
 * 替换imports
 * @param content
 * @param imports
 * @return content
 */
function doImport(content, imports) {
  debugInfo(debugKey, "将import写入到vite的配置文件");
  let importStr = '';
  if (imports) {
    for (const importsKey in imports) {
      importStr += `import ${importsKey} from '${imports[importsKey]}';`;
    }
  }
  return content.replace(replacePlace.$import, importStr)
}

/**
 * 替换alias
 * @param content
 * @param alias
 * @return content
 */
function doAlias(content, alias) {
  debugInfo(debugKey, "将alias写入到vite的配置文件");
  let aliasStr = '';
  if (alias) {
    aliasStr += 'let alias = {';
    for (const aliasKey in alias) {
      aliasStr += `'${aliasKey}': ${alias[aliasKey]},`;
    }
    aliasStr += '}';
  } else {
    aliasStr = 'let alias = {}'
  }
  const index = content.indexOf(replacePlace.$alias);
  const pre = content.substr(0, index);
  const post = content.substr(index + replacePlace.$alias.length);
  return `${pre}${aliasStr}${post}`;
}

/**
 * 替换proxy
 * @param content
 * @param proxy
 * @return content
 */
function doProxy(content, proxy) {
  debugInfo(debugKey, "将proxy写入到vite的配置文件");
  let proxyStr = '';
  if (proxy) {
    proxyStr += 'let proxy = {';
    for (const key in proxy) {
      proxyStr += `'${key}': ${JSON.stringify(proxy[key])},`;
    }
    proxyStr += '}';
  } else {
    proxyStr = 'let proxy = {}'
  }
  return content.replace(replacePlace.$proxy, proxyStr);
}

/**
 * 替换esbuild
 * @param content
 * @param esBuild
 * @return content
 */
function doEsBuild(content, esBuild) {
  debugInfo(debugKey, "将esbuild写入到vite的配置文件");
  let str = '';
  if (esBuild) {
    str += 'let esbuild = {';
    for (const key in esBuild) {
      str += `${key}: "${esBuild[key]}",`;
    }
    str += '}';
  } else {
    str += 'let esbuild = {};';
  }
  return content.replace(replacePlace.$esbuild, str || '{}');
}

function doDefine(content, define) {
  debugInfo(debugKey, "将define写入到vite的配置文件");
  let str = '';
  if (define) {
    str += 'let define = {';
    define.forEach((item) => {
      str += `${item},`;
    })
    str += '}';
  } else {
    str += 'let define = {};';
  }
  return content.replace(replacePlace.$define, str || '{}');
}

/**
 * 处理optimizeDeps配置 || rollupOptions配置
 * @param content
 * @param serve
 * @param build
 * @param type
 * @param replace
 * @return {*}
 */
function doReplace(content, { serve, build }, type, replace) {
  let str = ''
  if (serve && Object.keys(serve).length > 0) {
    str += `if(command === 'serve') {`;
    for (const key in serve) {
      str += `${type}.${key} = ${serve[key]};`;
    }
    str += '}'
  }
  if (build && Object.keys(build).length > 0) {
    str += `if(command === 'build') {`;
    for (const key in build) {
      str += `${type}.${key} = ${build[key]};`;
    }
    str += '}'
  }
  return content.replace(replace, str);
}

/**
 * 处理vite.config.js
 * @param base 路径
 * @param imports 引用包的路径 map对象，如：vitePluginReactJsSupport: 'vite-plugin-react-js-support'
 * @param alias alias 别名 map 如: {"react": "react-native-web"}
 * @param proxy vite proxy 代理，字符串，如
 * @param plugins vite imports 所对应的plugin，字符串数组, 如["vitePluginReactJsSupport()"]
 * @param esbuild esbuild config
 * @param optimizeDeps vite optimizeDeps配置 字符串
 * @param rollupOptions vite rollupOptions 配置 字符串
 */

function doViteConfig({ imports, alias, proxy, plugins, define, esBuild, optimizeDeps, rollupOptions }) {
  const { base } = getParams();
  let content = viteConfig;
  content = doImport(content, imports);
  content = doAlias(content, alias);

  content = doProxy(content, proxy);
  content = doEsBuild(content, esBuild);
  content = doDefine(content, define);

  // 替换plugin
  if (Array.isArray(plugins) && plugins.length > 0) {
    debugInfo(debugKey, "将plugin写入到vite的配置文件");
    const replacePlugins = plugins.join('');
    content = content.replace(replacePlace.$plugin, replacePlugins);
  } else {
    content = content.replace(replacePlace.$plugin, '');
  }

  if (optimizeDeps) {
    debugInfo(debugKey, "将optimizeDeps写入到vite的配置文件");
    content = doReplace(content, optimizeDeps, 'optimizeDeps', replacePlace.$optimizeDepsDefine);
  }
  if (rollupOptions) {
    debugInfo(debugKey, "将rollupOptions写入到vite的配置文件");
    content = doReplace(content, rollupOptions, 'rollupOptions', replacePlace.$rollupOptionsDefine);
  }

  const viteFile = path.resolve(base, './vite.config.js');
  debugInfo(debugKey, "汇总并写入到vite.config.js");
  content = beautify(content, {
    indent_size: 2,
    space_in_empty_paren: true,
  });
  fs.writeFileSync(viteFile, content);
}

module.exports = {
  doViteConfig
}
