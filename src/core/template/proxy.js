// 开发环境下所对应的接口代理，与webpack的一致。
export default {
  '^/api/.*': {
    target: 'http://api.qq.com',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, '/apis') // 将 /api 重写为/apis
  },
  '^/api2/.*': {
    target: 'http://api.qq.com',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api2/, '') // 将 /api2 重写为空
  }
}
