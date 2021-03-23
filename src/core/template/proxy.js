// 开发环境下所对应的接口代理，与webpack的一致。
export default {
  '/api': {
    target: 'http://api.qq.com/api/v1',
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, '') // 将 /api 重写为空
  }
}
