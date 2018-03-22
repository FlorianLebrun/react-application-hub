import React, { Component } from 'react'
import "./index.css"

export default class HubItemMenu extends Component {
  props: Object

  handleClick = (action) => () => {
    const { current } = this.props
    if (action) {
      current.postMessage(`{"action":"${action}"}`)
    }
  }
  render() {
    const { menu } = this.props
    return (<div className="tab-menu">
      {menu && menu.map((x, i) => {
        let icon = x.icon
        if (icon) {
          const parts = icon.split(":")
          if (parts[0] === "fa") icon = "menu-btn fa fa-fw fa-" + parts[1]
          else icon = "menu-btn fa fa-fw fa-" + icon
          return (<span key={i} className={icon} title={x.title} onClick={this.handleClick(x.action)} >
            {x.name}
          </span>)
        }
        else {
          return (<span key={i} className="menu-btn menu-name" title={x.title} onClick={this.handleClick(x.action)}>
            {x.name}
          </span>)
        }
      })}
    </div>)
  }
}
