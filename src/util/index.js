/**
 * 3位版本号对比， 当前版本是否大于等于目标版本
 * @param current
 * @param version
 * @returns {boolean}
 * 2.0.3 > 1.0.3 true;
 * 2.0.3 < 2.0.4: false;
 * 2.0.3 === 2.0.3 true;
 */
function compareVersion(current, version) {
  const curs = current.split('.');
  const vers = version.split('.');
  for(let i= 0; i< 3; i++) {
    if(curs[i] > curs[i]) {
      return true
    } else if (curs[i] < vers[i]) {
      return false;
    } else {
      continue;
    }
  }
  return true;
}

/**
 *
 * @param num
 * @return boolean
 */
function isNumber(num) {
  num = +num;
  return typeof num === 'number' && !isNaN(num)
}

/**
 * 获取版本信息
 * @param dep 2.0.3 || ^2.0.3
 * @return string
 */
function getVersion(dep) {
  if(!dep) {
    return '0.0.0';
  }
  if (!isNumber(dep.substr(0, 1))) {
    dep = dep.slice(1);
  }
  return dep;
}

/**
 *
 * @param json
 * @return {boolean} 是否大于17
 */
function checkReactIs17(json){
  const deps = json.dependencies;
  const devDeps = json.devDependencies;
  // 判断react版本是否大于等于17
  const reactV = getVersion(deps.react || devDeps.react);
  const react17 = compareVersion(reactV, '17.0.0');
  // 判断react-scripts版本是否大于等于4
  const scriptV = getVersion(deps['react-scripts'] || devDeps['react-scripts']);
  const script4 = compareVersion(scriptV, '4.0.0');
  return react17 || script4;
}

module.exports = {
  compareVersion,
  getVersion,
  isNumber,
  checkReactIs17
}