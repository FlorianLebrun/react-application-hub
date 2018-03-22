import React, { Component } from 'react'
import FrameInstance from "./FrameInstance"
import HubItemTabs from './HubItemTabs'

class FrameManifold extends Component {
  props: Object
  frames: Array<FrameInstance> = []
  current: FrameInstance

  componentWillMount() {
    window.addEventListener("message", this.handleMessage)
    window.addEventListener("hashchange", this.handleHash)
    window.addEventListener("keydown", this.handleKeydown)
  }
  componentWillUnmount() {
    window.removeEventListener("message", this.handleMessage)
    window.removeEventListener("hashchange", this.handleHash)
    window.removeEventListener("keydown", this.handleKeydown)
  }
  componentDidMount() {
    this.handleHash()
  }
  handleKeydown = (e) => {
    if (e.keyCode == 82 && e.ctrlKey) {
      this.current && this.current.reload()
      e.preventDefault()
      e.stopPropagation()
    }
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

export default FrameManifold