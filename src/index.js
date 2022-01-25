import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "mobx-react";
import store from "@/store";
import Root from "@/router";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <Provider {...store}>
    <Root />
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
