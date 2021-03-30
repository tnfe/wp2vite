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


module.exports = {
  compareVersion,
  getVersion,
}