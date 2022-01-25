import { makeAutoObservable } from "mobx";

class Store {
  constructor() {
    makeAutoObservable(this);
  }
  loading = false;
  loadingTips = "请稍候...";
}

export default new Store();
