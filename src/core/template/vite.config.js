import { defineConfig } from 'vite'
import * as path from 'path'
import * as fs from 'fs'
// import proxy from "./config/proxy"
import reactRefresh from '@vitejs/plugin-react-refresh'
// import vitePluginImp from 'vite-plugin-imp'

// https://cn.vitejs.dev/config/
export default defineConfig({
  base: './', // index.html文件所在位置
  root: './', // js导入的资源路径，src
  resolve: {
    alias: {},
  },
  esbuild: {
    include: ['ts', 'tsx', 'js', 'jsx'],
  },
  server: {
    // proxy: proxy, // 代理
  },
  build: {
    minify: 'terser', // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
    manifest: false, // 是否产出maifest.json
    sourcemap: false, // 是否产出soucemap.json
    outDir: 'build', // 产出目录
  },
  plugins: [
    // react-refresh插件
    reactRefresh(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
      }
    }
  },
})

