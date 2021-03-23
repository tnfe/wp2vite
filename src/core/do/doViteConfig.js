const fs = require('fs');
const path = require('path');

function doViteConfig(base) {
  const file = path.resolve(__dirname, '../template/vite.config.js');
  const content = fs.readFileSync(file);
  const viteFile = path.resolve(base, './vite.config.js');
  fs.writeFileSync(viteFile, content);
}

module.exports = {
  doViteConfig
}