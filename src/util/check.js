const { getVersion, compareVersion } = require('./util.js');

/**
 *
 * @param json
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
 * @param json
 * @return {{isReactMoreThan17: boolean, isVue: boolean, isReactCreateApp: boolean, isReactAppRewired: boolean, isReact: boolean, reactEject: boolean}}
 */
function checkJson(json) {
  let isReact = false;
  let isVue = false;
  let reactEject = true;
  let isReactCreateApp = false;
  let isReactAppRewired = false;
  let isReactMoreThan17 = false;

  const deps = { ...json.dependencies, ...json.devDependencies };
  if (deps['react']) {
    isReact = true;
    if (deps['react-scripts']) {
      reactEject = false;
      isReactCreateApp = true;
    } else if (deps['react-app-rewired']) {
      isReactAppRewired = true;
    } else {
      isReactCreateApp = true;
    }
    isReactMoreThan17 = checkReactIs17(deps);
  } else if (deps['vue']) {
    isVue = true;
  }
  return {
    isReact, isVue, reactEject, isReactCreateApp, isReactAppRewired, isReactMoreThan17
  }
}

module.exports = {
  checkJson,
}