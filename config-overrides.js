const path = require('path')

const { override, fixBabelImports, addLessLoader, addDecoratorsLegacy, disableEsLint, addWebpackAlias } = require('customize-cra')
const paths = require('react-scripts/config/paths')
paths.appBuild = path.join(path.dirname(paths.appBuild), 'dist') // 修改打包目录

module.exports = override(
  addWebpackAlias({
    ['@']: path.resolve(__dirname, 'src')
  }),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css'
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { '@primary-color': '#1DA57A' },
  }),
  addDecoratorsLegacy(),
  disableEsLint()
)
