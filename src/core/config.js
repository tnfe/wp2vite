const fs = require('fs');
const path = require('path');
const resolve = require('resolve');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');

function getConfigPath(base, config) {
  const result = path.resolve(base, config);
  if (fs.existsSync(result)) {
    return result;
  } else {
    return false;
  }
}

async function getPackageJson(base) {
  try {
    const file = path.resolve(base, 'package.json');
    const json = await loadJsonFile(file);
    return json;
  } catch (err) {
    return {};
  }
}

function checkEject(json) {
  // 是否进行了eject
  let eject = true;
  // 遍历json的scripts，看是否有react-scripts
  for (const script in json.scripts) {
    if (json.scripts[script].includes('react-scripts')) {
      eject = false;
      break;
    }
  }
  return eject;
}

async function writePackageJson(base, json) {
  const file = path.resolve(base, 'package.json');
  await writeJsonFile(file, json);
}

function checkoutTJSConfig(base) {
  const hasTsConfig = fs.existsSync(path.join(base, '/tsconfig.json'));
  const hasJsConfig = fs.existsSync(path.join(base, '/jsconfig.json'));
  return {
    hasTsConfig, hasJsConfig
  };
}

async function getAliasConfByConfig(base, hasTsConfig, hasJsConfig) {
  const file = path.join(base, hasTsConfig ? '/tsconfig.json' : '/jsconfig.json');
  let json;
  if (hasTsConfig) {
    const ts = require(resolve.sync('typescript', {
      basedir: path.join(base, '/node_modules'),
    }));
    json = ts.readConfigFile(file, ts.sys.readFile).config;
  } else {
    json = require(file);
  }
  if (json && json.compilerOptions && json.compilerOptions.baseUrl) {
    const alias = {}
    const src = json.compilerOptions.baseUrl;
    const files = fs.readdirSync(path.join(base, '/' + src));
    files.forEach(function (item, index) {
      let stat = fs.statSync(path.join(base,  '/' + src + '/' + item));
      if (stat.isDirectory() === true) {
        alias[item] = `path.resolve(__dirname, '${src}/${item}')`;
      }
    })
    return alias;
  }
  return null;
}

module.exports = {
  getConfigPath,
  getPackageJson,
  writePackageJson,
  checkEject,
  checkoutTJSConfig,
  getAliasConfByConfig
}