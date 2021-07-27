const viteConfig = `
/* eslint-disable */
$import
// @see https://cn.vitejs.dev/config/
export default ({command, mode}) => {
  let rollupOptions = {};
  $rollupOptionsDefine

  let optimizeDeps = {};
  $optimizeDepsDefine

  $alias

  $proxy
  
  $define

  $esbuild

  return {
    base: './', // index.html文件所在位置
    root: './', // js导入的资源路径，src
    resolve: {
      alias,
    },
    define: define,
    server: {
      // 代理
      proxy,
    },
    build: {
      target: 'es2015',
      minify: 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
      manifest: false, // 是否产出maifest.json
      sourcemap: false, // 是否产出soucemap.json
      outDir: 'build', // 产出目录
      rollupOptions,
    },
    esbuild,
    optimizeDeps,
    plugins: [
      $plugin
    ],
    css: {
      preprocessorOptions: {
        less: {
          // 支持内联 JavaScript
          javascriptEnabled: true,
        }
      }
    },
  }
}`

module.exports = {
  viteConfig
}
