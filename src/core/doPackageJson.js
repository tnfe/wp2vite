const { writePackageJson } = require('../util/fileHelp.js');
const { debugInfo } = require('../util/debug.js');

const prefix = 'vite-'
const scripts = {
  dev: 'vite',
  start: 'vite',
  preview: 'vite preview',
  build: 'vite build',
}

// 处理package.json，增加新增的依赖
async function rewriteJson(base, json, deps) {
  debugInfo("package", "开始写入依赖");
  let njson = JSON.parse(JSON.stringify(json));
  // 处理devDependencies
  if(!njson.devDependencies) {
    njson.devDependencies = {};
  }
  njson.devDependencies.vite = '^2.1.0';
  for (const dep in deps) {
    njson.devDependencies[dep] = deps[dep];
  }

  debugInfo("package", "开始写入scripts");
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
  debugInfo("package", "处理完成");
  await writePackageJson(base, njson);
}


module.exports = {
  rewriteJson
}
