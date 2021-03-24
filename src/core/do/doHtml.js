const fs = require('fs');
const { html } = require('../template/index.html.js');

function doCraHtml(base, appIndex) {
  const file = base + '/index.html';
  const content = html.replace('$main', appIndex);
  fs.writeFileSync(file, content);
  // 删除掉public下面的index.html
  const public = base + '/public/index.html';
  if(fs.existsSync(public)) {
    fs.unlinkSync(public);
  }
}

module.exports = {
  doCraHtml
}