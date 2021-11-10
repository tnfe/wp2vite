// 项目类型
const projectType = {
  cra: 'create-react-app',
  rar: 'react-app-rewired',
  vue: 'vue-cli',
  other: 'other',
};

// 罗列一些通用项目的配置文件
const webpackPath = {
  craNoEject: './node_modules/react-scripts/config/webpack.config.js',
  craWithEject: './config/webpack.config.js',
  rar: './config-overrides.js',
  vue: './vue.config.js',
  vueWebpack: './node_modules/@vue/cli-service/webpack.config.js',
  vueConfig: './vue.config.js',
};

// vite所对应的一些配置站位
const replacePlace = {
  $import: '$import',
  $esbuild: '$esbuild',
  $alias: '$alias',
  $proxy: '$proxy',
  $define: '$define',
  $plugin: '$plugin',
  $rollupOptionsDefine: '$rollupOptionsDefine',
  $optimizeDepsDefine: '$optimizeDepsDefine',
};

module.exports = {
  projectType,
  webpackPath,
  replacePlace,
};

