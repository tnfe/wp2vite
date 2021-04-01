[English](./README.md) | 简体中文

<p align="center">
  <a href="https://www.npmjs.com/package/wp2vite" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://github.com/dravenww/wp2vite/blob/master/logo.png?raw=true" alt="wp2vite logo">
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
一个将webpack项目转为vite项目的前端自动化转换工具

## react
- 支持[create-react-app](https://github.com/facebook/create-react-app)创建的项目, 无论项目是否已执行弹出配置
- 支持[react-app-rewired](https://github.com/timarney/react-app-rewired)配置的项目
- 支持[webpack.config.js](https://github.com/webpack/webpack)创建的项目

## vue
- 支持[vue-cli](https://github.com/vuejs/vue-cli)创建的项目, 无论项目是否包含`vue.config.js`文件
## other
- 其他包含[webpack.config.js](https://github.com/webpack/webpack)文件的项目均支持转换

# install
```
npm install -g wp2vite
```
# use
```
cd yourwork/your_project // go to your project catalog
wp2vite 
or 
wp2vite init

npm install // install dependencies

npm run dev // start server
or
npm run vite-start // start server
```
