import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import "font-awesome/css/font-awesome.min.css"
import "./index.css"

class AppInstance {
  name: string
  node: HTMLIFrameElement

  constructor(name: string, url: string) {
    this.name = name
    this.node = document.createElement("iframe")
    this.node.style.display = "none";
    this.node.src = url
  }
}

class HubItem extends Component {
  props: Object

  handleClick = () => {
    const { onSelect, frame } = this.props
    onSelect && onSelect(frame)
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
    >
      <span className="icon fa fa-image" />
      <span className="label">{title || frame.name}</span>
      <span className="cross fa fa-times" />
    </div>)
  }
}

class HubItemTabs extends Component {
  props: Object

  render() {
    const { frames, current, onSelect } = this.props
    return (<div>
      {frames.map((frame, i) => {
        return (<HubItem key={i} frame={frame} isCurrent={frame === current} onSelect={onSelect} />)
      })}
    </div>)
  }
}

class HubComponent extends Component {
  props: Object
  frames: Array<AppInstance> = []
  current: AppInstance

  componentWillMount() {
  }
  componentDidMount() {
    this.attachFrame(new AppInstance("totorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", "http://localhost:9988/#/storage-browser-plugin"))
    this.attachFrame(new AppInstance("titi", "http://localhost:9988/#/console-plugin"))
    this.attachFrame(new AppInstance("titi", "http://localhost:9988/#/console-plugin"))
    this.attachFrame(new AppInstance("react", "https://www.qwant.com/?q=react+script&client=opensearch"))
    this.selectFrame(this.frames[0])
  }
  attachFrame(frame: AppInstance) {
    const { host } = this.refs
    this.frames.push(frame)
    host.appendChild(frame.node)
  }
  dettachFrame(frame: AppInstance) {
    const { host } = this.refs
    const index = this.frames.indexOf(frame)
    this.frames.splice(index, 1)
    host.removeChild(frame.node)
  }
  selectFrame = (frame: AppInstance) => {
    if (this.current) {
      this.current.node.style.display = "none";
    }
    this.current = frame
    if (this.current) {
      this.current.node.style.display = "block";
    }
    this.forceUpdate()
  }
  render() {
    return (<div ref="host" className="react-app-hub" >
      <HubItemTabs frames={this.frames} current={this.current} onSelect={this.selectFrame} />
    </div>)
  }
}

ReactDOM.render(<HubComponent />, document.getElementById('root'));
