const fs = require('fs');
const { debugInfo } = require('../util/debug.js');
const { html } = require('../template/index.html.js');

function doHtml(base, root, entries) {
  debugInfo('html', `将入口写入到html文件`);
  const file = base + '/index.html';
  let scripts = '';
  entries.forEach((item) => {
    scripts += `<script type="module" src="${item}"></script>`
  })
  const content = html.replace('$root', root).replace('$script', scripts);
  fs.writeFileSync(file, content);
  debugInfo('html', `html处理完成`);
}

function doReactHtml(base, entries) {
  doHtml(base, 'root', entries);
}

function doVueHtml(base, entries) {
  doHtml(base, 'app', entries);
}

function doOtherHtml(base, entries) {
  doHtml(base, 'root', entries);
}

module.exports = {
  doReactHtml,
  doVueHtml,
  doOtherHtml,
}
