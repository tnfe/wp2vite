const fs = require('fs');
const path = require('path');
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

async function writePackageJson(base, json) {
  const file = path.resolve(base, 'package.json');
  await writeJsonFile(file, json);
}

module.exports = {
  getConfigPath,
  getPackageJson,
  writePackageJson
}