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
  njson.devDependencies['less'] = '^4.1.1';
  njson.devDependencies['@vitejs/plugin-react-refresh'] = '^1.3.1';
  njson.devDependencies['vite-plugin-react-js-support'] = '^1.0.5';
  njson.devDependencies['@babel/plugin-transform-react-jsx'] = '^7.13.12';

  // 处理scripts，增加vite命令
  if (!njson.scripts) {
    njson.scripts = {};
  }
  const scripts = {
    dev: 'vite',
    start: 'vite',
    preview: 'vite preview',
    build: 'vite build',
  }
  for (let viteKey in scripts) {
    const value = scripts[viteKey];
    viteKey = njson.scripts[viteKey] ? prefix + viteKey : viteKey;
    njson.scripts[viteKey] = value;
  }
  // 把处理后的json写回到package.json
  await writePackageJson(base, njson);
}


module.exports = {
  rewriteJson
}