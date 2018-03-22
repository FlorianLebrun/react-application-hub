
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
  postMessage(data) {
    if (data instanceof Object) data = JSON.stringify(data)
    this.node.contentWindow.postMessage(data, '*');
  }
  reload() {
    //this.node.contentWindow.location.reload();
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

export default FrameInstance