const { writePackageJson } = require('../config.js');
const prefix = 'vite-'
// 处理package.json，增加新增的依赖
async function rewriteJson(base, json) {
  let njson = JSON.parse(JSON.stringify(json));
  // 处理devDependencies
  if(!njson.devDependencies) {
    njson.devDependencies = {};
  }
  njson.devDependencies.vite = '^2.1.0';
  njson.devDependencies['@vitejs/plugin-react-refresh'] = 'latest';
  njson.devDependencies['vite-plugin-react-js-support'] = 'latest';
  njson.devDependencies['@babel/plugin-transform-react-jsx'] = 'latest';

  // 处理scripts，增加vite命令
  if (!njson.scripts) {
    njson.scripts = {};
  }
  const scripts = {
    dev: 'NODE_ENV=development vite',
    start: 'NODE_ENV=development vite',
    preview: 'vite preview',
    build: 'vite build',
  }
  for (let viteKey in scripts) {
    const value = scripts[viteKey];
    viteKey = njson.scripts[viteKey] ? prefix + viteKey : viteKey;
    njson.scripts[viteKey] = value;
  }
  // delete njson.babel;
  // 把处理后的json写回到package.json
  await writePackageJson(base, njson);
}


module.exports = {
  rewriteJson
}