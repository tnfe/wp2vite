const { getConfigPath, getPackageJson } = require('../config.js');
const { doCraHtml } = require('./doHtml.js');
const { doViteConfig } = require('./doViteConfig.js');
const { webpackPath } = require('../constant.js');

const { checkReactIs17 } = require('../../util/index.js')

const {rewriteJson} = require('./doPackageJson.js');

async function doWithCra(base, config, type) {
  console.log("正在处理package.json文件")
  // 获取项目package.json文件
  const json = await getPackageJson(base);
  // 是否进行了eject
  let eject = true;
  // 遍历json的scripts，看是否有react-scripts
  for (const script in json.scripts) {
    if (json.scripts[script].includes('react-scripts')) {
      eject = false;
      break;
    }
  }
  const isReactMoreThan17 = checkReactIs17(json);

  await rewriteJson(base, json);

  console.log("正在处理webpack.config.js文件")
  let configFile = eject ? webpackPath.craWithEject : webpackPath.craNoEject;
  // 获取webpack的配置文件地址
  const configPath = getConfigPath(base, configFile);
  // 设置环境变量
  process.env.NODE_ENV = 'development';

  // 获取webpack配置的alias；
  const alias = {}
  if (!configPath) {
    throw new Error("为获取到webpack.config.js，请用参数输入 --config");
  }
  const webpackConfig = require(configPath);
  let configJson = {};
  if (typeof webpackConfig === "function") {
    configJson = webpackConfig('development');
  } else {
    configJson = webpackConfig;
  }

  const configAlias = configJson.resolve.alias;
  for (const configAliasKey in configAlias) {
    alias[configAliasKey] = configAlias[configAliasKey]
  }

  const appIndexJs = configJson.entry.replace(process.cwd(), '');
  console.log(appIndexJs)

  console.log("正在处理入口index.html文件")
  doCraHtml(base, appIndexJs);
  console.log("正在处理入口vite的配置文件")
  doViteConfig(base);
  console.log('万事俱备，只欠东风');
  console.log(`cd ${base}`);
  console.log(`npm install`);
  console.log(`npm run start`);
}

module.exports = doWithCra