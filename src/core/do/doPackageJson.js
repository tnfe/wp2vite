const { writePackageJson } = require('../config.js');
// 重写package.json
async function rewriteJson(base, json) {
  let njson = JSON.parse(JSON.stringify(json));
  // 处理dependencies
  if (json.dependencies) {
    njson.dependencies = {};
    const oriDep = json.dependencies;
    for (const key in oriDep) {
      let need = key !== 'react-scripts';
      if(need) {
        njson.dependencies[key] = oriDep[key];
      }
    }
  }
  // 处理devDependencies
  if(json.devDependencies) {
    njson.devDependencies = {};
    const oriDep = json.devDependencies;
    for (const key in oriDep) {
      njson.devDependencies[key] = json[key];
    }
  }
  if(!njson.devDependencies) {
    njson.devDependencies = {};
  }
  njson.devDependencies.vite = '^2.1.0';
  njson.devDependencies['vite'] = '^2.1.0';
  njson.devDependencies['less'] = '^4.1.1';
  njson.devDependencies['@vitejs/plugin-react-refresh'] = '^1.3.1';
  njson.devDependencies['vite-plugin-react-js-support'] = '^1.0.3';
  njson.devDependencies['@babel/plugin-transform-react-jsx'] = '^7.13.12';
  // 处理scripts
  if (json.scripts) {
    njson.scripts = {};
    const oriScripts = json.scripts;
    for (const key in oriScripts) {
      njson.scripts[key] = oriScripts[key];
    }
  }
  njson.scripts['dev'] = 'vite';
  njson.scripts['start'] = 'vite';
  njson.scripts['build'] = 'vite build';
  njson.scripts['serve'] = 'vite preview';
  njson.scripts['preview'] = 'vite preview';
  njson.scripts['test'] = 'jest';
  njson.scripts['snap'] = 'jest -u';
  delete njson.scripts.eject;

  // 把处理后的json写回到package.json
  await writePackageJson(base, njson);
}


module.exports = {
  rewriteJson
}