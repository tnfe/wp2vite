const fs = require('fs');
const path = require('path');
const { replacePlace } = require('../constant.js')

/**
 * 替换imports
 * @param content
 * @param imports
 * @return content
 */
function doImport(content, imports) {
  let importStr = '';
  if (imports) {
    for (const importsKey in imports) {
      importStr += `import ${importsKey} from '${imports[importsKey]}';\n`;
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

  let aliasStr = '';
  if(alias) {
    aliasStr += 'let alias = {\n';
    for (const aliasKey in alias) {
      aliasStr += `'${aliasKey}': ${alias[aliasKey]},\n`;
    }
    aliasStr += '}';
  } else {
    aliasStr = 'let alias = {}'
  }
  return content.replace(replacePlace.$alias, aliasStr);
}

/**
 * 替换proxy
 * @param content
 * @param proxy
 * @return content
 */
function doProxy(content, proxy) {
  let proxyStr = '';
  if(proxy) {
    proxyStr += 'let proxy = {\n';
    for (const key in proxy) {
      proxyStr += `'${key}': ${proxy[key]},\n`;
    }
    proxyStr += '\n}';
  } else {
    proxyStr = 'let proxy = {}'
  }
  return content.replace(replacePlace.$proxy, proxyStr);
}

/**
 * 替换esbuild
 * @param content
 * @param esbuild
 * @return content
 */
function doEsBuild(content, esBuild) {
  let str = '';
  if (esBuild) {
    str += 'let esbuild = {\n';
    for (const key in esBuild) {
      str += `${key}: "${esbuild[key]}",\n`;
    }
    str += '\n}';
  } else {
    str += 'let esbuild = {};';
  }
  return content.replace(replacePlace.$esbuild, str || '{}');
}

/**
 * 处理vite.config.js
 * @param base 路径
 * @param imports 引用包的路径 map对象，如：vitePluginReactJsSupport: 'vite-plugin-react-js-support'
 * @param alias alias 别名 map 如: {"react": "react-native-web"}
 * @param proxy vite proxy 代理，字符串，如
 * @param plugins vite imports 所对应的plugin，字符串数组, 如["vitePluginReactJsSupport()"]
 * @param esbuild esbuild config
 * @param optimizeDepsDefine vite optimizeDeps配置 字符串
 * @param rollupOptionsDefine vite rollupOptions 配置 字符串
 */

function doViteConfig(base, { imports, alias, proxy, plugins, esbuild, optimizeDepsDefine, rollupOptionsDefine }) {
  const file = path.resolve(__dirname, '../template/vite.config.js');
  let content = fs.readFileSync(file, {
    encoding: 'utf-8',
  });
  content = doImport(content, imports);
  content = doAlias(content, alias);
  content = doProxy(content, proxy);
  content = doEsBuild(content, esbuild);

  // 替换plugin
  if(plugins) {
    const replacePlugins = plugins.join('\n');
    content = content.replace(replacePlace.$plugin, replacePlugins);
  } else {
    content = content.replace(replacePlace.$plugin, '');
  }

  content = content.replace(replacePlace.$optimizeDepsDefine, optimizeDepsDefine || '');

  content = content.replace(replacePlace.$rollupOptionsDefine, rollupOptionsDefine || '');

  const viteFile = path.resolve(base, './vite.config.js');
  fs.writeFileSync(viteFile, content);
}

module.exports = {
  doViteConfig
}