import proxy from "./config/proxy"
import reactRefresh from '@vitejs/plugin-react-refresh';
import vitePluginReactJsSupport from 'vite-plugin-react-js-support';

// https://cn.vitejs.dev/config/
export default ({command, mode}) => {
  const rollupOptions = {};
  if (command === 'serve') {
    rollupOptions.input = [];
  }
  return {
    base: './', // index.html文件所在位置
    root: './', // js导入的资源路径，src
    resolve: {
      alias: {},
    },
    server: {
      // proxy: proxy, // 代理
    },
    build: {
      minify: 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
      manifest: false, // 是否产出maifest.json
      sourcemap: false, // 是否产出soucemap.json
      outDir: 'build', // 产出目录
      rollupOptions: rollupOptions,
    },
    optimizeDeps: {
      entries: false,
    },
    plugins: [
      // react-refresh插件
      reactRefresh(),
      vitePluginReactJsSupport(),
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
}