const fs = require('fs');
const { debugInfo } = require('../util/debug.js');
const { html } = require('../template/index.html.js');

function doHtml(base, root, appIndex) {
  debugInfo('html', `将入口写入到html文件`);
  const file = base + '/index.html';
  const content = html.replace('$root', root).replace('$main', appIndex);
  fs.writeFileSync(file, content);
  debugInfo('html', `html处理完成`);
  // 删除掉public下面的index.html
  // const public = base + '/public/index.html';
  // if(fs.existsSync(public)) {
  //   fs.unlinkSync(public);
  // }
}

function doReactHtml(base, appIndex) {
  doHtml(base, 'root', appIndex);
}

function doVueHtml(base, appIndex) {
  doHtml(base, 'app', appIndex);
}

module.exports = {
  doReactHtml,
  doVueHtml,
}