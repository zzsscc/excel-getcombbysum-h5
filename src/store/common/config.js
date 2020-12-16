import { observable, action } from 'mobx'

class Store {
  @observable a = 1

  @action
  add = () => {
    ++this.a
  }
};

export default new Store()