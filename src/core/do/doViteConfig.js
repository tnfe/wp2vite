const fs = require('fs');
const path = require('path');
const { replacePlace } = require('../constant.js')
/**
 * 处理vite.config.js
 * @param base 路径
 * @param imports 引用包的路径 map对象，如：vitePluginReactJsSupport: 'vite-plugin-react-js-support'
 * @param alias alias 别名 map 如: {"react": "react-native-web"}
 * @param proxy vite proxy 代理，字符串，如
 * @param plugins vite imports 所对应的plugin，字符串数组, 如["vitePluginReactJsSupport()"]
 * @param optimizeDepsDefine vite optimizeDeps配置 字符串
 * @param rollupOptionsDefine vite rollupOptions 配置 字符串
 */

function doViteConfig(base, { imports, alias, proxy, plugins, esbuild, optimizeDepsDefine, rollupOptionsDefine }) {
  const file = path.resolve(__dirname, '../template/vite.config.js');
  let content = fs.readFileSync(file, {
    encoding: 'utf-8',
  });
  // 替换imports
  let importStr = '';
  if (imports) {
    for (const importsKey in imports) {
      importStr += `import ${importsKey} from '${imports[importsKey]}';\n`;
    }
  }
  content = content.replace(replacePlace.$import, importStr)
  // 替换alias
  let aliasStr = '';
  if(alias) {
    aliasStr += 'let alias = {\n';
    for (const aliasKey in alias) {
      aliasStr += `'${aliasKey}': '${alias[aliasKey]}',\n`;
    }
    aliasStr += '\n}';
  } else {
    aliasStr = 'let alias = {}'
  }
  content = content.replace(replacePlace.$alias, aliasStr);

  // 替换proxy
  let proxyStr = '';
  if(proxy) {
    proxyStr += 'let proxy = {\n';
    for (const proxyKey in proxy) {
      proxyStr += `'${proxyKey}': ${proxy[proxyKey]},\n`;
    }
    proxyStr += '\n}';
  } else {
    proxyStr = 'let proxy = {}'
  }
  content = content.replace(replacePlace.$proxy, proxyStr);

  // 替换plugin
  if(plugins) {
    const replacePlugins = plugins.join('\n');
    content = content.replace(replacePlace.$plugin, replacePlugins);
  } else {
    content = content.replace(replacePlace.$plugin, '');
  }

  let esbuildStr = '';
  if (esbuild) {
    esbuildStr += 'let esbuild = {\n';
    for (const key in esbuild) {
      esbuildStr += `${key}: "${esbuild[key]}",\n`;
    }
    esbuildStr += '\n}';
  } else {
    esbuildStr += 'let esbuild = {};';
  }
  content = content.replace(replacePlace.$esbuild, esbuildStr || '{}');

  content = content.replace(replacePlace.$optimizeDepsDefine, optimizeDepsDefine || '');

  content = content.replace(replacePlace.$rollupOptionsDefine, rollupOptionsDefine || '');

  const viteFile = path.resolve(base, './vite.config.js');
  fs.writeFileSync(viteFile, content);
}

module.exports = {
  doViteConfig
}