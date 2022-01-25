import React, { Component, lazy, Suspense } from "react";
import {
  BrowserRouter,
  HashRouter,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { inject, observer } from "mobx-react";
import { upperFirst, camelCase } from "lodash";
import { Spin } from "antd";

/**
 * 懒加载引入页面
 */
const LoaderLoaderSec = lazy(() => import("@/pages/loader/loaderSec"));

/**
 * @description 不自动加载的页面集合，同pages的name格式（首字母大写的驼峰）
 * 需要手动引入加载
 */
const ignorePage = ["LoaderLoaderSec"];
/**
 * 使用文件夹路径及文件夹名自动加载和命名路由
 * @description 统一加载src/pages下所有index.js/jsx，生成路由和component。路由使用-连接，无大写（文件夹名中间的大写转小写前面拼-，开头的只转小写）
 * @return {} [{ component, name, path }, ...]
 */
const pages = [];
const pagesLoader = require.context("@/pages", true, /index\.(jsx|js)$/i);
pagesLoader.keys().forEach((fileName) => {
  const component = pagesLoader(fileName).default;
  const name = upperFirst(
    camelCase(`${fileName.replace(/\.\/|\/index\.\w+$/gi, "")}`.split(/\/|-/gi))
  );
  if (ignorePage.includes(name)) return;
  let path = `${fileName.replace(/^\.|\/index\.\w+$/gi, "")}`;
  const capitalize = (s) => {
    let words = s.split("");
    const reg = /^[A-Z]+$/;
    for (let i = 0; i < words.length; i++) {
      if (reg.test(words[i])) {
        words[i] = `${["/", "-"].includes(words[i - 1]) ? "" : "-"}${words[
          i
        ].toLowerCase()}`;
      }
    }
    return words.join("");
  };
  path = `${capitalize(path)}`;
  pages.push({
    component,
    name,
    path,
  });
});

const Fallback = <Spin />;

@inject("commonGlobalStore")
@observer
class Index extends Component {
  render() {
    const { loading, loadingTips } = this.props.commonGlobalStore;
    return (
      <HashRouter>
        <Suspense fallback={Fallback}>
          <Spin spinning={loading} tip={loadingTips}>
            <Switch>
              {pages.length &&
                pages.map((r) => (
                  <Route key={r.name} path={r.path} component={r.component} />
                ))}
              <Route path="/tt/:id?" component={LoaderLoaderSec} />
              <Redirect path="*" to="/home" />
            </Switch>
          </Spin>
        </Suspense>
      </HashRouter>
    );
  }
}

export default Index;
