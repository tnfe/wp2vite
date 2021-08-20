English | [简体中文](./README.zh-CN.md)

<p align="center">
  <a href="https://www.npmjs.com/package/wp2vite" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://github.com/tnfe/wp2vite/blob/master/logo.png?raw=true" alt="wp2vite logo">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/vite"><img src="https://img.shields.io/badge/vite-v2.1.0-brightgreen" alt="npm vite"></a>
  <a href="https://www.npmjs.com/package/webpack"><img src="https://img.shields.io/badge/npm-v2.1.4-brightgreen" alt="npm webpack"></a>
  <a href="https://www.npmjs.com/package/wp2vite"><img src="https://img.shields.io/badge/webpack->=4-brightgreen" alt="npm package"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/badge/node->=10-brightgreen" alt="node compatility"></a>
</p>
<br/>

# wp2vite
It has been officially included，[detail](https://github.com/vitejs/awesome-vite#vue-cli)

## Overview

A front-end project automatic conversion tool, You can make your [webpack](https://webpack.js.org/) project support [vite](https://vitejs.dev/).

wp2vite will not delete your webpack configuration, but will inject vite configuration into your project to support vite.

The development speed is about 80% faster than that of webpack, and the construction speed is about 50% faster than that of webpack.

## Examples
- [vite-concent-pro](https://github.com/tnfe/vite-concent-pro)

## Detailed

### react
- react projects created by [create-react-app](https://github.com/facebook/create-react-app)  are supported,whether or not eject is performed
- react projects created by [react-app-rewired](https://github.com/timarney/react-app-rewired)  are supported
- react projects created by [webpack.config.js](https://github.com/webpack/webpack)  are supported

### vue
- vue projects created by [vue-cli](https://github.com/vuejs/vue-cli) are supported,whether or not contains vue.config.js

### other
- other projects crated by [webpack.config.js](https://github.com/webpack/webpack)  are supported

## install
```
npm install -g wp2vite
```
## use
```
cd yourwork/your_project // go to your project catalog
wp2vite 
or
wp2vite --config=./webpack.config.js // with config file

wp2vite -v // check wp2vite version

npm install // install dependencies

npm run dev // start server
or
npm run vite-dev // start server
```

## Contribute

If you spotted a bug,please submit a pull request with a bug fix.

If you would like to add a feature or change existing behaviour, open an [issue](https://github.com/tnfe/wp2vite/issues) and tell about what exactly you want to change/add.

## License

[MIT](./LICENSE)
