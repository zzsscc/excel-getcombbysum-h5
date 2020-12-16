/* common */
const requireCommonStore = require.context('@/store/common', true, /[a-z0-9]+\.(js)$/i)
const commonStores = {}
requireCommonStore.keys().forEach((fileName) => {
  const model = requireCommonStore(fileName).default
  const name = `${fileName.replace(/\.\/|\.\w+$/ig, '')}CommonStore`
  commonStores[name] = model
})

export default commonStores
