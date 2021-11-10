const path = require('path');
const { debugInfo } = require('../util/debug.js');
const writeJsonFile = require('write-json-file');
const { getParams, getPackageJson } = require('../util/env.js');

const prefix = 'vite-';
const scripts = {
  dev: 'vite',
  start: 'vite',
  preview: 'vite preview',
  build: 'vite build',
};

const writePackageJson = async (base, json) => {
  const file = path.resolve(base, 'package.json');
  await writeJsonFile(file, json);
};

/**
 * 处理package.json，增加新增的依赖
 * @param devDeps
 * @return {Promise<void>}
 */
const doPackageJson = async (devDeps) => {
  const { base } = getParams();
  const json = await getPackageJson(base);
  debugInfo("pack", "依赖写入");

  const newJson = JSON.parse(JSON.stringify(json));

  // 处理devDependencies
  if(!newJson.devDependencies) {
    newJson.devDependencies = {};
  }
  newJson.devDependencies.vite = '^2.1.0';
  for (const dep in devDeps) {
    newJson.devDependencies[dep] = devDeps[dep];
  }

  // 处理scripts，增加vite命令
  if (!newJson.scripts) {
    newJson.scripts = {};
  }
  for (let viteKey in scripts) {
    const value = scripts[viteKey];
    viteKey = newJson.scripts[viteKey] ? prefix + viteKey : viteKey;
    newJson.scripts[viteKey] = value;
  }
  // 把处理后的json写回到package.json
  debugInfo("pack", "依赖写入完成");
  await writePackageJson(base, newJson);
};


module.exports = {
  doPackageJson,
};
