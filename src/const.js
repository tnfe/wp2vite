const projectType = {
  cra: 'create-react-app',
  rar: 'react-app-rewired',
  vue: 'vue-cli',
  other: 'other',
}

const webpackPath = {
  craNoEject: './node_modules/react-scripts/config/webpack.config.js',
  craWithEject: './config/webpack.config.js',
  rar: './config-overrides.js',
  vue: './vue.config.js',
  vueWebpack: './node_modules/@vue/cli-service/webpack.config.js',
  vueConfig: './vue.config.js',
}

const replacePlace = {
  $import: '$import',
  $esbuild: '$esbuild',
  $alias: '$alias',
  $proxy: '$proxy',
  $define: '$define',
  $plugin: '$plugin',
  $rollupOptionsDefine: '$rollupOptionsDefine',
  $optimizeDepsDefine: '$optimizeDepsDefine',
}

module.exports = {
  projectType,
  webpackPath,
  replacePlace,
}

