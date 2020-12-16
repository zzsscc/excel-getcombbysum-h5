import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'

@inject('configCommonStore')
@observer
class Index extends Component {
  render () {
    const { a } = this.props.configCommonStore
    return (
      <div>{a}v-b-c</div>
    )
  }
}

export default Index
