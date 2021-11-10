// jest --updateSnapshot 或 jest -u 更新快照

const jestConfig = {
  // export default {
  // 搜索文件目录的路径列表
  roots: ['<rootDir>'],
  // 收集测试覆盖率的匹配文件规则集合
  // collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
  collectCoverageFrom: [
    'src/**/*.js',
  ],
  // 运行测试文件的目录规则，在src的同级目录test下，或者src目录下的__tests__目录下，或者src目录下spec,test后缀的文件
  testMatch: [
    '<rootDir>/src/**/__test__/**/*.{js,ts}',
    '<rootDir>/src/**/*.{spec,test}.{js,ts}',
    '<rootDir>/test/**/*.{spec,test}.{js,ts}',
    // 以下仅用于本地临时单独测试某些文件用
    // '<rootDir>/src/controllers/view/__tests__/**/*.{js,ts}',
  ],
  // 配置忽略文件的规则
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|ts)$'],
  // 模块别名设置，解析模块时要搜索的其他位置的绝对路径
  modulePaths: ['<rootDir>/src'],
  // 用于查找的文件扩展名集合
  moduleFileExtensions: ['js', 'ts', 'json'],
  // 测试报告处理器
  reporters: ['default'],
  // 开启覆盖率收集
  collectCoverage: true,
};

module.exports = jestConfig;
