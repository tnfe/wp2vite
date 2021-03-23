const fs = require('fs');
const { html } = require('../template/index.html.js');

function doHtml(base, appIndex) {
  const file = base + '/index.html';
  const content = html.replace('$main', appIndex);
  fs.writeFileSync(file, content);
}

module.exports = {
  doHtml
}