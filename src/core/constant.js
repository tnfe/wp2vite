const projectType = {
  cra: 'create-react-app',
  vue: 'vue-cli',
  other: 'other',
}

const webpackPath = {
  craNoEject: './node_modules/react-scripts/config/webpack.config.js',
  craWithEject: './config/webpack.config.js',
  vue: './config/index.js',
}

module.exports = {
  projectType,
  webpackPath,
}