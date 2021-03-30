const { writePackageJson } = require('../util/fileHelp.js');

const prefix = 'vite-'
const scripts = {
  dev: 'NODE_ENV=development vite',
  start: 'NODE_ENV=development vite',
  preview: 'vite preview',
  build: 'vite build',
}

// 处理package.json，增加新增的依赖
async function rewriteJson(base, json, deps) {
  let njson = JSON.parse(JSON.stringify(json));
  // 处理devDependencies
  if(!njson.devDependencies) {
    njson.devDependencies = {};
  }
  njson.devDependencies.vite = '^2.1.0';
  for (const dep in deps) {
    njson.devDependencies[dep] = deps[dep];
  }

  // 处理scripts，增加vite命令
  if (!njson.scripts) {
    njson.scripts = {};
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