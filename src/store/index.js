import { camelCase } from 'lodash';

const requireStore = require.context('@/store', true, /[a-z0-9]+\.(js)$/i);
const stores = {};
requireStore.keys().forEach((fileName) => {
  // 一级目录的index.xx文件忽略
  if (fileName.replace(/\.\/|.\w+$/ig, '') === 'index') return;
  const model = requireStore(fileName).default;
  const name = `${camelCase(fileName.replace(/\.\/|\/index\.\w+$|.\w+$/ig, ''))}Store`;
  stores[name] = model;
});

export default stores;
