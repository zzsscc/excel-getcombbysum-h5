import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("commonConfigStore")
@observer
class Index extends Component {
  render() {
    const { a } = this.props.commonConfigStore;
    return <div>{a}v-b-c</div>;
  }
}

export default Index;
