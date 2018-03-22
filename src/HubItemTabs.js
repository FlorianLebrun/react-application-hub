import React, { Component } from 'react'
import HubItemMenu from './HubItemMenu'

class HubItem extends Component {
  props: Object

  handleClick = (e) => {
    this.props.frame.select()
    e.stopPropagation()
  }
  handleDblClick = (e) => {
    window.open(this.props.frame.url)
    e.stopPropagation()
  }
  handleClose = (e) => {
    this.props.frame.close()
    e.stopPropagation()
  }
  handleWheelClose = (e) => {
    if (e.button === 1) this.handleClose(e)
  }
  render() {
    const { frame, isCurrent } = this.props
    const node = frame.node
    return (<div
      title={frame.title ? `${frame.title} (${frame.url})` : frame.url}
      className={isCurrent ? "tab-item current" : "tab-item"}
      onClick={this.handleClick}
      onDoubleClick={this.handleDblClick}
      onMouseDown={this.handleWheelClose}
    >
      <span className={"icon fa fa-" + frame.icon} />
      <span className="label">{frame.title || frame.url}</span>
      <span className="cross fa fa-times" onClick={this.handleClose} />
    </div>)
  }
}

export default class HubItemTabs extends Component {
  props: Object

  render() {
    const { frames, current, onSelect } = this.props
    return (<div className="tabs">
      <div className="tabs-bar">
        {frames.map((frame, i) => {
          return (<HubItem key={i} frame={frame} isCurrent={frame === current} onSelect={onSelect} />)
        })}
      </div>
      <HubItemMenu current={current} menu={current && current.menu} />
    </div>)
  }
}
