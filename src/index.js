import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import "font-awesome/css/font-awesome.min.css"
import "./index.css"

class FrameInstance {
  title: string
  icon: string
  url: string
  node: HTMLIFrameElement
  manifold: FrameManifold
  menu: Array

  constructor(manifold: FrameManifold, url: string, title: string, icon: string) {
    this.title = title
    this.icon = icon || "image"
    this.manifold = manifold
    this.node = document.createElement("iframe")
    this.node.style.display = "none";
    this.node.src = this.url = url
  }
  receiveMessage(msg) {
    const { manifold } = this
    if (msg.redirect) {
      this.node.src = this.url = msg.redirect
    }
    else if (msg.open) {
      const { open } = msg
      if (typeof open === "string") this.manifold.openFrame(open)
      else if (typeof open === "object") this.manifold.openFrame(open.url, open.title, open.icon)
    }
    else if (msg.infos) {
      const { infos } = msg
      this.title = infos.title || this.title
      this.icon = infos.icon || this.icon
      manifold.forceUpdate()
    }
    else if (msg.menu) {
      this.menu = msg.menu
      manifold.forceUpdate()
    }
    else {
      alert("frame receive" + JSON.stringify(msg))
    }
  }
  postMessage(msg) {
    this.node.contentWindow.postMessage(msg, '*');
  }
  display(show: boolean) {
    if (show) {
      this.node.style.display = "block";
    }
    else {
      this.node.style.display = "none";
    }
  }
  select() {
    this.manifold.selectFrame(this)
  }
  close() {
    this.manifold.dettachFrame(this)
  }
}

class HubMenu extends Component {
  props: Object

  render() {
    const { menu } = this.props
    return (<div className="tab-menu">
      {menu && menu.map((x, i) => {
        return (<span key={i} className={"menu-btn fa fa-fw fa-" + x.icon} title={x.title}>
        </span>)
      })}
    </div>)
  }
}

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

class HubItemTabs extends Component {
  props: Object

  render() {
    const { frames, current, onSelect } = this.props
    return (<div className="tabs">
      <div className="tabs-bar">
        {frames.map((frame, i) => {
          return (<HubItem key={i} frame={frame} isCurrent={frame === current} onSelect={onSelect} />)
        })}
      </div>
      <HubMenu menu={current && current.menu} />
    </div>)
  }
}

class FrameManifold extends Component {
  props: Object
  frames: Array<FrameInstance> = []
  current: FrameInstance

  componentWillMount() {
    window.addEventListener("message", this.handleMessage)
    window.addEventListener("hashchange", this.handleHash)
  }
  componentWillUnmount() {
    window.removeEventListener("message", this.handleMessage)
  }
  componentDidMount() {
    this.handleHash()
  }
  handleHash = () => {
    const hash = window.location.hash
    if (hash.charCodeAt(0) === "#".charCodeAt(0)
      && hash.charCodeAt(1) === "/".charCodeAt(0)
    ) {
      const url = hash.substring(2)
      const frame = this.openFrame(url)
      if (this.current !== frame) {
        if (this.current) this.current.display(false)
        this.current = frame
        if (this.current) this.current.display(true)
        this.forceUpdate()
      }
    }
  }
  handleMessage = (msg) => {
    try {
      const data = JSON.parse(msg.data)
      for (const frame of this.frames) {
        if (msg.source === frame.node.contentWindow) {
          return frame.receiveMessage(data)
        }
      }
    }
    catch (e) { }
  }
  findFrame(url): FrameInstance {
    for (const frame of this.frames) {
      if (frame.url === url) {
        return frame
      }
    }
  }
  openFrame(url, title, icon) {
    let frame = this.findFrame(url)
    if (!frame) {
      frame = new FrameInstance(this, url, title, icon)
      this.attachFrame(frame)
    }
    this.selectFrame(frame)
    return frame
  }
  attachFrame(frame: FrameInstance) {
    const { host } = this.refs
    this.frames.push(frame)
    host.appendChild(frame.node)
  }
  dettachFrame(frame: FrameInstance) {
    const { host } = this.refs
    const index = this.frames.indexOf(frame)
    this.frames.splice(index, 1)
    host.removeChild(frame.node)
    if (this.current === frame) this.selectFrame(this.frames[0])
    else this.forceUpdate()
  }
  selectFrame = (frame: FrameInstance) => {
    if (this.current !== frame) {
      window.location.hash = frame ? "#/" + frame.url : ""
    }
  }
  render() {
    return (<div ref="host" className="react-app-hub" >
      <HubItemTabs frames={this.frames} current={this.current} />
    </div>)
  }
}

ReactDOM.render(<FrameManifold />, document.getElementById('root'));
