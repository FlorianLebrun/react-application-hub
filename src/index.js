import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import "font-awesome/css/font-awesome.min.css"
import "./index.css"

class FrameInstance {
  name: string
  url: string
  node: HTMLIFrameElement
  manifold: FrameManifold

  constructor(name: string, url: string, manifold: FrameManifold) {
    this.name = name
    this.manifold = manifold
    this.node = document.createElement("iframe")
    this.node.style.display = "none";
    this.node.src = this.url = url
  }
  receiveMessage(msg) {
    if (msg.redirect) {
      this.node.src = this.url = msg.redirect
    }
    else if (msg.open) {
      this.manifold.openFrame(msg.open, msg.open, true)
    }
    else if (msg.title) {
      this.node.title
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

class HubItem extends Component {
  props: Object

  handleClick = (e) => {
    this.props.frame.select()
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
    let title
    try {
      title = node.contentWindow.document.title
    }
    catch (e) { }
    return (<div
      title={frame.name}
      className={isCurrent ? "tab-item current" : "tab-item"}
      onClick={this.handleClick}
      onMouseDown={this.handleWheelClose}
    >
      <span className="icon fa fa-image" />
      <span className="label">{title || frame.name}</span>
      <span className="cross fa fa-times" onClick={this.handleClose} />
    </div>)
  }
}

class HubItemTabs extends Component {
  props: Object

  render() {
    const { frames, current, onSelect } = this.props
    return (<div className="tabs">
      {frames.map((frame, i) => {
        return (<HubItem key={i} frame={frame} isCurrent={frame === current} onSelect={onSelect} />)
      })}
    </div>)
  }
}

class FrameManifold extends Component {
  props: Object
  frames: Array<FrameInstance> = []
  current: FrameInstance

  componentWillMount() {
    window.addEventListener("message", this.handleMessage)
  }
  componentWillUnmount() {
    window.removeEventListener("message", this.handleMessage)
  }
  componentDidMount() {
    this.openFrame("localhost:3000", "http://localhost:3000/")
    this.openFrame("storage-browser-plugin", "http://localhost:9988/#/storage-browser-plugin")
    this.openFrame("console-plugin", "http://localhost:9988/#/console-plugin")
    this.openFrame("react", "https://www.qwant.com/?q=react+script&client=opensearch")
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
  openFrame(name, url, show) {
    let frame = this.findFrame(url)
    if (!frame) {
      frame = new FrameInstance(name, url, this)
      this.attachFrame(frame)
    }
    if (show || !this.current) this.selectFrame(frame)
    else this.forceUpdate()
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
      if (this.current) this.current.display(false)
      this.current = frame
      if (this.current) this.current.display(true)
      this.forceUpdate()
    }
  }
  render() {
    return (<div ref="host" className="react-app-hub" >
      <HubItemTabs frames={this.frames} current={this.current} />
    </div>)
  }
}

ReactDOM.render(<FrameManifold />, document.getElementById('root'));
