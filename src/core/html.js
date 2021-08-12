const fs = require('fs');
const path = require('path');
const { debugInfo } = require('../util/debug.js');
const { html } = require('../template/index.html.js');
const { getParams } = require('../util/env.js');
const { getWebpackHtmlPluginConfig } = require('../util/webpack.js');

const defaultHead = `
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
`;

function doHtml(root, entries) {
  const { base } = getParams();
  debugInfo('html', `将入口写入到html文件`);
  let head = defaultHead;

  let publicHtml = false;
  const htmlOptions = getWebpackHtmlPluginConfig();
  if (htmlOptions && htmlOptions.template) {
    publicHtml = htmlOptions.template;
  } else {
    const defaults = path.resolve(base, './public/index.html');
    if (fs.existsSync(defaults)) {
      publicHtml = defaults;
    }
  }
  if (publicHtml) {
    const htmlContent = fs.readFileSync(publicHtml, {
      encoding: 'utf-8',
    });
    const match = htmlContent.match(/<head[^>]*>(.|\n)*<\/head>/gi);
    if (match && match[0]) {
      head = match[0];
      head = head.replace(/%PUBLIC_URL%/ig, '');
      head = head.replace(/<%=(.*)%>/ig, '');
    }
  }
  let content = html.replace('$head', head);

  let scripts = '';
  entries.forEach((item) => {
    scripts += `<script type="module" src="${item}"></script>`
  })
  content = content.replace('$root', root).replace('$script', scripts);
  const file = base + '/index.html';
  fs.writeFileSync(file, content);
  debugInfo('html', `html处理完成`);
}

function doReactHtml(entries) {
  doHtml('root', entries);
}

function doVueHtml(entries) {
  doHtml('app', entries);
}

function doOtherHtml(entries) {
  doHtml('root', entries);
}

module.exports = {
  doReactHtml,
  doVueHtml,
  doOtherHtml,
}
