const fs = require('fs');
const { debugInfo } = require('../util/debug.js');
const { html } = require('../template/index.html.js');

function doCraHtml(base, appIndex) {
  debugInfo('html', `将入口写入到html文件`);
  const file = base + '/index.html';
  const content = html.replace('$main', appIndex);
  fs.writeFileSync(file, content);
  debugInfo('html', `html处理完成`);
  // 删除掉public下面的index.html
  // const public = base + '/public/index.html';
  // if(fs.existsSync(public)) {
  //   fs.unlinkSync(public);
  // }
}

module.exports = {
  doCraHtml
}