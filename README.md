hello，大家好，我是德莱问，今天为大家带来vite解析。

最后提供一个使用vite+react+concent的一个后台项目。
# 写在前面的话

vite，号称是下一代前端开发和构建工具。vite的出现得益于浏览器对module的支持，利用浏览器的新特性去实现了极速的开发体验；能够极快的实现热重载(hmr).

开发模式下，利用浏览器的module支持，达到了极致的开发体验；

正式环境的编译打包，使用了首次提出tree-shaking的rollup进行构建；

vite提供了很多的配置选项，包括vite本身的配置，esbuild的配置，rollup的配置等等，今天带领大家从源码的角度看看vite。

vite其实是可以分为三部分的，一部分是开发过程中的client部分；一部分是开发过程中的server部分；另外一部分就是与生产有关系的打包编译部分，由于vite打包编译其实是用的rollup，我们不做解析，只看前两部分。

# vite-client

vite的client其实是作为一个单独的模块进行处理的，它的源码是放在`packages/vite/src/client`；这里面有四个文件：
- client.ts： 主要的文件入口，下面着重介绍；
- env.ts：环境相关的配置，这里会把我们在vite.config.js(vite配置文件)的define配置在这里进行处理；
- overlay.ts: 这个是一个错误蒙层的展示，会把我们的错误信息进行展示；
- tsconfig.json： 这就是ts的配置文件了。

## 工具部分
client里面是提供了一系列工具函数，主要是为了hmr；

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fd2dd14ad0d4487cab8570469d2fec5a~tplv-k3u1fbpfcp-watermark.image)

## websocket部分

- 建立websocket连接
- 调用上面的overlay进行错误展示
- Message通信

其中message通信部分有多种事件类型，可以参见下图：


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/962546ae928e430f861d534804b0ce5b~tplv-k3u1fbpfcp-watermark.image)

## 举例说明
使用vite-app创建了一个简单的demo：
```
yarn create @vitejs/app my-react-ts-app --template react-ts
```
使用以上命令，可以简单的创建一个react-ts的vite应用。

```
npm install
npm run dev
```
执行以上命令，进行安装依赖，然后启动服务，打开浏览器: [http://localhost:3000/](http://localhost:3000/),network界面，可以看到有如下请求：


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1b3051ea0faa482fa997198fb03d8b1d~tplv-k3u1fbpfcp-watermark.image)

我把这几种类型的数据进行了划分，按照不同的类型进行不同的划分:


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/523d7cddc2574d9faa2d762a7241440f~tplv-k3u1fbpfcp-watermark.image)

咱们接下来来分析下，html的内容：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
<script type="module" src="/@vite/client"></script>
  <script type="module">
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
</script>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
可以看到，涉及到js的一共三块：
- client，请求路径为/@vite/client,请注意这个路径，这是vite本身的依赖的路径；
- react-refresh的模块代码，这是插件react-refresh注入的代码；代码内部又请求了@react-refresh，这是插件react-refresh的sdk的请求；
- main,请求路径为/src/main/tsc，这是与咱们项目中的真实代码相关的；

除了上面的三个外，还有一个env,请求路径为/@vite/env.js，这个就是@vite/client内部发出的对env依赖的请求：`import '/node_modules/vite/dist/client/env.js';`;

当然还有@react-refresh的sdk请求；

除了上面所提到的js之外，其他的请求其实就是我们项目代码里面的请求了；

 client第一部要做的事情就是建立websocket通信通道，可以看到上面的websocket类型的localhost请求，这就是client与server端通信，进行热更新等的管道。
 
 # vite- server
 说完了client，我们回到server部分，入口文件为`packages/vite/src/node/serve.ts`，最主要的逻辑其实是在`packages/vite/src/node/server/index.ts`;我们暂且把server端称为node端，node端主要包含几种类型文件的处理，毕竟这只是个代理服务器；
 
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f844e7b448743b1916f7355f8a2fbb3~tplv-k3u1fbpfcp-watermark.image)

我们从几个部分来看看这几种类型的处理
## node watcher
watcher的主要作用是对于文件变化的监听，然后与client端进行通信：
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/49214bbc502e4664915ca0301c267cbd~tplv-k3u1fbpfcp-watermark.image)

监听的目录为整个项目的根目录，watchOptions为`vite.config.js`里面的server.watch配置，初始化代码如下：
```
// 使用chokidar进行对文件目录的监听，
  const watcher = chokidar.watch(path.resolve(root), {
    ignored: ['**/node_modules/**', '**/.git/**', ...ignored],
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ...watchOptions
  }) as FSWatcher
```
启动对文件的监听：
```
// 如果发生改变，调用handleHMRUpdate，
  watcher.on('change', async (file) => {
    file = normalizePath(file)
    // invalidate module graph cache on file change
    moduleGraph.onFileChange(file)
    if (serverConfig.hmr !== false) {
      try {
        await handleHMRUpdate(file, server)
      } catch (err) {
        ws.send({
          type: 'error',
          err: prepareError(err)
        })
      }
    }
  })

  // 增加文件连接
  watcher.on('add', (file) => {
    handleFileAddUnlink(normalizePath(file), server)
  })

  // 减少文件连接
  watcher.on('unlink', (file) => {
    handleFileAddUnlink(normalizePath(file), server, true)
  })
```
监听对应的事件所对应的处理函数在`packages/vite/src/node/server/hmr.ts`文件里面。再细节的处理，我们不做说明了，其实里面逻辑是差不太多的，最后都是调用了websocket，发送到client端。

## node 依赖类型
依赖类型，其实也就是node_modules下面的依赖包，例如：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/546beb71773440bd91d4152f3b231d43~tplv-k3u1fbpfcp-watermark.image)
这些包属于基本不会变的类型，vite的做法是把这些依赖，在服务启动的时候放到`.vite`目录下面,收到的请求直接去.vite下面获取，然后返回。
## node 静态资源
静态资源其实也就是我们了解和熟悉的public/下面的或者static/下面的内容，这些资源属于静态文件，例如：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/069259469cdd4fda9ccf36f0734cfb08~tplv-k3u1fbpfcp-watermark.image)
这样的数据，vite不做任何处理，直接返回。

## node html
对于入口文件`index.html`，我们这里暂且只讲单入口文件，多入口文件vite也是支持的，详情可见[多页面应用](https://cn.vitejs.dev/guide/build.html#%E5%A4%9A%E9%A1%B5%E9%9D%A2%E5%BA%94%E7%94%A8%E6%A8%A1%E5%BC%8F)；
```
// 删减后得代码如下
// @file packages/vite/src/node/server/middlewares/indexHtml.ts
export function indexHtmlMiddleware(server){
  return async (req, res, next) => {
    const url = req.url && cleanUrl(req.url)
    const filename = getHtmlFilename(url, server)
    try {
      // 从本地读取index.html的内容
      let html = fs.readFileSync(filename, 'utf-8')
      // dev模式下调用createDevHtmlTransformFn转换html的内容，插入两个script
      html = await server.transformIndexHtml(url, html)
      // 把html的内容返回。
      return send(req, res, html, 'html')
    } catch (e) {
      return next(e)
    }
  }
}
```
对于入口文件index.html，vite首先会从硬盘上读取文件的内容，经过一系列操作后，把操作后的内容进行返回，我们来看看这个一系列操作：

- 调用createDevHtmlTransformFn去获取处理函数：
```
// @file packages/vite/src/node/plugins/html.ts
export function resolveHtmlTransforms(plugins: readonly Plugin[]) {
  const preHooks: IndexHtmlTransformHook[] = []
  const postHooks: IndexHtmlTransformHook[] = []

  for (const plugin of plugins) {
    const hook = plugin.transformIndexHtml
    if (hook) {
      if (typeof hook === 'function') {
        postHooks.push(hook)
      } else if (hook.enforce === 'pre') {
        preHooks.push(hook.transform)
      } else {
        postHooks.push(hook.transform)
      }
    }
  }

  return [preHooks, postHooks]
}

// @file packages/vite/src/node/server/middlewares/indexHtml.ts
export function createDevHtmlTransformFn(server: ViteDevServer) {
  const [preHooks, postHooks] = resolveHtmlTransforms(server.config.plugins)
  return (url: string, html: string): Promise<string> => {
    return applyHtmlTransforms(
      html,
      url,
      getHtmlFilename(url, server),
      [...preHooks, devHtmlHook, ...postHooks],
      server
    )
  }
}
```
此处，我们还是拿react项目为例，**react-refresh的插件被插入到了postHooks里面**；最后其实是返回了一个无名的promise类型的函数；此处也就是闭包了。无名函数里面调用的是`applyHtmlTransforms`,我们来看下参数:
- html为根目录下面的index.html的内容
- url为/index.html，
- 第三个参数的执行结果为/index.html
- 第四个参数为一个大数组，prehooks是空的，第二个为是vite自己的/@vite/client链接的返回函数，第三个是有一个react-refresh的插件在里面的
- 第五个参数为当前server

接下来是applyHtmlTransforms的调用时刻，此处会改写html内容，然后返回。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f87fab8235b64d5d8ac7a77d8345a621~tplv-k3u1fbpfcp-watermark.image)

最后处理好的html的内容，就是我们上面看到的html的内容。

## node 其他类型
暂时把其他类型都算为其他类型，包括@vite开头的/@vite/client和业务相关的请求；这些请求都会走同一个`transformMiddleware`中间件。此中间件所做的工作如下：

`// @file packages/vite/src/node/server/middlewares/transform.ts`

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e014893e1cdb4a03b4e0bf56c6d98d55~tplv-k3u1fbpfcp-watermark.image)

其实上面的逻辑正常走下来，是会到命中缓存和未命中缓存中的，二选一，命中就直接返回了，没有命中的话，就是走到了transform，接下来我们看下调用`transform`的过程：
```
// @file packages/vite/src/node/server/transformRequest.ts
// 调用插件获取当前请求的id，如/@react-refresh,当然也有获取不到的情况；
const id = (await pluginContainer.resolveId(url))?.id || url
// 调用插件获取插件返回的内容，如/@react-refresh,肯定有不是插件返回的情况，
const loadResult = await pluginContainer.load(id, ssr)
// 接下来是重点
// 如果没有获取到结果，也就是不是插件类型的请求，如我们的入口文件/src/main.tsx
if (loadResult == null) {
    // 从硬盘读取非插件提供的返回结果
    code = await fs.readFile(file, 'utf-8')
  } else {
    if (typeof loadResult === 'object') {
      code = loadResult.code
      map = loadResult.map
    } else {
      code = loadResult
    }
  }
}
// 启动文件监听，调用watcher，和上面讲到的watcher遥相呼应
ensureWatchedFile(watcher, mod.file, root)
// 代码运行到这里，是获取到内容了不假，不过code还是源文件，也就是编写的文件内容
// 下面的transform是开始进行替换
const transformResult = await pluginContainer.transform(code, id, map, ssr)
code = transformResult.code!
map = transformResult.map
return (mod.transformResult = {
      code,
      map,
      etag: getEtag(code, { weak: true })
    } as TransformResult)

```
大体的流程如下：


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4d5533e6c4fa410682249b7e9b2e39c9~tplv-k3u1fbpfcp-watermark.image)

```
async transform(code, id, inMap, ssr) {
  const ctx = new TransformContext(id, code, inMap as SourceMap)
  ctx.ssr = !!ssr
  for (const plugin of plugins) {
    if (!plugin.transform) continue
    ctx._activePlugin = plugin
    ctx._activeId = id
    ctx._activeCode = code
    let result
    try {
      result = await plugin.transform.call(ctx as any, code, id, ssr)
    } catch (e) {
      ctx.error(e)
    }
    if (!result) continue
    if (typeof result === 'object') {
      code = result.code || ''
      if (result.map) ctx.sourcemapChain.push(result.map)
    } else {
      code = result
    }
  }
  return {
    code,
    map: ctx._getCombinedSourcemap()
  }
},
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0ab9f76838024c50bc6dfbd4e8ec6596~tplv-k3u1fbpfcp-watermark.image)

其实到这里，我们对于vite server所实现的功能基本是已经清楚了，代理服务器，然后对引用修改为自己的规则，对自己的规则进行解析处理。尤为重要的其实是` vite:import-analysis`这个插件。

# vite + react 

开始之前先附上地址：[github：vite-react-concent-pro](https://github.com/tnfe/vite-concent-pro)；这个项目是由[github：webpack-react-concent-pro](https://github.com/tnfe/concent-pro)项目改过来的，业务逻辑代码模块没动，只改动了编译打包部分。

在这里说下由webpack改为vite的过程和其中遇到的一些问题。

项目的改动其实是不大的，基本就是clone下项目下来后，把webpack相关的依赖去掉，然后换成vite，记得加上react的vite插件：[@vitejs/plugin-react-refresh](https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh);换完以后，因为我们项目中的引用路径是在src文件夹下面的，所以我们需要为vite提供下别名：

```
resolve: {
    alias: { // 别名
      "configs": path.resolve(__dirname, 'src/configs'),
      "components": path.resolve(__dirname, 'src/components'),
      "services": path.resolve(__dirname, 'src/services'),
      "pages": path.resolve(__dirname, 'src/pages'),
      "types": path.resolve(__dirname, 'src/types'),
      "utils": path.resolve(__dirname, 'src/utils'),
    },
},
```
这样我们不用改动里面的引用，就可以让vite知道去哪里找哪个文件了。
引用中有对`process.env.***`类似的引用，用此来判断一些环境相关的逻辑，在vite中是没有了，vite的环境变量是通过`import.meta.env.***`;

改完这些执行`npm run start`,是可以正常跑起来的。

## 坑1

在执行`npm run build`后，我们在进行预览的时候，执行`npm run preview`,出现了下面的画面：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8dc4fde1b68147c69ff2d6500a1dd1c4~tplv-k3u1fbpfcp-watermark.image)
出现了这种没见过的错误，然后我们的解决办法是什么呢？

首先，把压缩给干掉，别压缩了，压缩后的代码全都是abcd，啥也看不出来；干掉的方式是改vite的配置：
```
build: {
    minify: false, // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
    manifest: false, // 是否产出maifest.json
    sourcemap: false, // 是否产出soucemap.json
    outDir: 'build', // 产出目录
  },
```
我们把minify改为了false，再重新执行build和preview命令，可以看到了精确的行，到底是哪里进行了报错.

关于最后是怎么解决的呢？TMD，竟然是一个object-inspect的库，引用了一个util的包，然后咱们的node_modules里面没有util的包。

这些个中缘由，就不多说了，折腾了两三个小时，解决办法就是一个命令：`npm i -S util`。

重新执行build和preview后，正常了。

## 坑2

本地开发启动start，build+preview都OK了，接下来，就得试试单测了。执行`npm run test`。果不其然，报错了，原因是没有babel-preset-react-app的babel配置。

那我们增加上配置那不就好了嘛？

我们在package.json里面增加了babel的配置： 
```
"bable": {
    "presets": [
        "react-app"
    ],
}
```

接着我们运行`npm run test`；嗯，OK了，跑成功了。

我们再重新测试下，执行`npm run start`,TMD挂了，跑步起来了！！！

**
Using `babel-preset-react-app` requires that you specify `NODE_ENV` or `BABEL_ENV` environment variables. Valid values are "development", "test", and "production". Instead, received: undefined
**

上面这句话啥意思呢？就是我们的`babel-preset-react-app`这个包运行的时候需要一个`process.env.NODE_ENV`或者`process.env.BABEL_ENV`的变量。
我们本着vite不在process上面搞事情的原则，这个问题是解决不了的，也就是说，不能通过配置的方式来实现babel的配置了，那怎么整？？

查了下`babel-preset-react-app`这个包的源码，发现是可以通过参数的形式传递进去的，所以我们得从test的时候所做的事情入手，test的时候，我们运行的是jest，jest是有它的配置文件的，叫`jest.config.js`；jest的配置文件里面有一个transform的对象，这个对象里面是有了`babel-jest`这个库，这也就是babel了。

我们得在这里搞点事情，最后经过多次调试，配置是这样的了：

```
// vite react项目里面单测需要在这里把babel-react-app传递进去，不可在项目中或者package.json里面配置babel
transform: {
    // vite react项目里面单测需要在这里把babel-react-app传递进去，不可在项目中或者package.json里面配置babel
    "^.+\\.(js|jsx|ts|tsx)$": ["<rootDir>/node_modules/babel-jest", {"presets": ['babel-preset-react-app'] }],
    "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
    "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>/config/jest/fileTransform.js",
  },
```
这就是个最大的坑，又耗费了我2个小时的时间折腾这个。

# 写在最后

vite已经发布了2版本，在公司内部的项目中，是可以进行使用了，由于线上线下跑的不是一套代码，尤老板还专门提供了个preview的功能，建议大家可以尝试一下。

另外上面说到的那个项目:[github：vite-react-concent-pro](https://github.com/tnfe/vite-concent-pro),目前包含的功能也是比较齐全的：
- start：本地启动开发与调试
- build：编译打包
- preview：预览打包完成的代码：
- test：单测
- snap：生成快照

该项目整合了react、concent(一个特别好用的状态管理库)、antd、react-router-dom、axios等，可以0成本接入开发。

当然了如果你的现有项目想改成vite，也是很简单的：
- 把该项目clone下来，把src下面的内容删掉；
- 把你的老项目的src下面的文件搬到这个项目的src文件下面，然后改改alias和process.env；
- 记得index.html要改成你的入口文件哦

接下来就等着见证奇迹吧

使用了vite之后，**npm run start能够提高80%左右**； **npm run build能够提高50%左右**

！嗯，真香~

最后，要是觉得写的还不错，记得点个赞，欢迎关注我的[github:draven](https://github.com/dravenww/blob)

