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

一个前端项目转换工具，可以让webpack项目支持vite

wp2vite 不会删除你的项目的webpack的配置文件，但是会在你的项目中插入vite的配置文件

相较于webpack，vite开发环境构建速度可以提升80%左右，构建生产环境能够提升50%左右

## support
### react
- 支持[create-react-app](https://github.com/facebook/create-react-app)创建的项目, 无论项目是否已执行eject配置
- 支持[react-app-rewired](https://github.com/timarney/react-app-rewired)配置的项目
- 支持[webpack.config.js](https://github.com/webpack/webpack)创建的项目

### vue
- 支持[vue-cli](https://github.com/vuejs/vue-cli)创建的项目, 无论项目是否包含`vue.config.js`文件

### other
- 其他包含[webpack.config.js](https://github.com/webpack/webpack) 文件的项目均支持转换

## 安装
```
npm install -g wp2vite
```
## 使用
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

## todo
- 支持自定义其他项目

## 贡献
如果你想解决一个缺陷，欢迎提pr

如果你想增加一个功能或者修改已有功能，请提[issue](https://github.com/tnfe/wp2vite/issues)

## License

[MIT](./LICENSE)
