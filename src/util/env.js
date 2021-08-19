const fs = require('fs');
const path = require('path');
const loadJsonFile = require('load-json-file');
const { debugError, debugWarning, debugInfo } = require('./debug.js');
const { getVersion, compareVersion } = require('./util.js');

let checked = false;
const env = {
  isReact: false,
  reactEject: false,
  isReactCreateApp: false,
  isReactAppRewired: false,
  isReactMoreThan17: false,

  isVue: false,
  isVue3: false,
  isVue2: false,
  isVueCli: false,
  isWebpack: true,

  isNeedConfig: false,
  hasConfig: false,
  packageJson: {},
};

const params = {
  base: false,
  config: '',
  force: false,
  debug: false,
}

/**
 *
 * @param deps
 * @return {boolean} 是否大于17
 */
function checkReactIs17(deps) {
  // 判断react版本是否大于等于17
  const reactV = getVersion(deps['react']);
  const react17 = compareVersion(reactV, '17.0.0');
  // 判断react-scripts版本是否大于等于4
  const scriptV = getVersion(deps['react-scripts']);
  const script4 = compareVersion(scriptV, '4.0.0');
  return react17 || script4;
}

/**
 *
 * @param deps
 * @return {boolean} 判断vue版本
 */
function checkVueVersion(deps, ver) {
  const version = getVersion(deps['vue']);
  const bigV = parseInt(version.split('.')[0], 10);
  return bigV === ver;
}

function checkScript(scripts, str) {
  for (let key in scripts) {
    const value = scripts.hasOwnProperty(key) ? scripts[key] : false;
    if (value && value.indexOf(str) !== -1) {
      return true;
    }
  }
  return false;
}

// 根据校验项目根目录下面是否有cra格式的scripts所对应的三个文件。
function checkScripts() {
  if (params.base) {
    const buildPath = path.resolve(params.base, './scripts/build.js');
    const startPath = path.resolve(params.base, './scripts/start.js');
    const testPath = path.resolve(params.base, './scripts/test.js');
    return fs.existsSync(buildPath) && fs.existsSync(startPath) && fs.existsSync(testPath);
  }
  return false;
}

const prepareEnv = (deps, json) => {
  if (deps['react']) {
    env.isReact = true;
    if (deps['react-app-rewired']){
      env.isReactAppRewired = true;
    }
    if (deps['react-scripts']) {
      env.isReactCreateApp = true;
      env.reactEject = false;
    } else if (checkScripts()) {
      env.reactEject = true;
      env.isReactCreateApp = true;
    } else {
      env.isNeedConfig = true;
    }
    env.isReactMoreThan17 = checkReactIs17(deps);
  } else if (deps['vue']) {
    env.isVue = true;
    if (deps['@vue/cli-service'] || checkScript(json.scripts, 'vue-cli-service')) {
      env.isVueCli = true;
    } else {
      env.isNeedConfig = true;
    }
    env.isVue2 = checkVueVersion(deps, 2);
    env.isVue3 = checkVueVersion(deps, 3);
  } else {
    debugError('目前仅支持 React/Vue 项目');
    process.exit(0);
  }
}

const saveEnv = async () => {
  const base = params.base;
  debugInfo('env', '开始分析项目属性');
  if (!base) {
    debugError('env', '参数获取失败');
    process.exit(0);
  }
  const json = await getPackageJson();
  env.packageJson = json;
  const deps = { ...json['dependencies'], ...json['devDependencies'] };
  prepareEnv(deps, json);
  checked = true;
  debugInfo('env', '项目属性分析完成');
}

const saveParams = (base, options) => {
  params.base = base;
  if (options.config && typeof options.config === "string") {
    const resolvePath = path.resolve(params.base, options.config);
    if (fs.existsSync(resolvePath)) {
      params.config = resolvePath;
      env.hasConfig = true;
    } else {
      debugWarning('params','config参数所对应文件不存在');
    }
  } else {
    params.config = false;
  }
  params.debug = options.debug;
  params.force = options.force;
}

const getEnv = () => {
  if (!checked) {
    debugError('env', '项目属性获取失败');
    process.exit(0);
  }
  return env;
}

const getParams = () => {
  if (params.base === false) {
    debugError('params','参数获取失败');
    process.exit(0);
  }
  return params;
}

const getPackageJson = async () => {
  const file = path.resolve(params.base, 'package.json');
  const json = await loadJsonFile(file);
  return json;
}

module.exports = {
  saveParams,
  saveEnv,
  getEnv,
  getParams,
  getPackageJson,
}
