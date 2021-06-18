export default class MarkManager {
  constructor(options) {
    this.viewer = options.viewer
    this.posList = []
    this.iconList = []
  }

  renderIcon({ domId, eleAry, imgSrc, type = 'icon', size = 20, callBack, props }) {
    let model = document.getElementById(domId)
    eleAry.forEach(e => {
      let pos3D = this.viewer.getScene().getElementsBBox([typeof e === 'string' ? e : e.id])
      let icon = document.createElement('img')
      icon.setAttribute('src', imgSrc)
      icon.style.width = size + 'px'
      icon.style.height = size + 'px'
      icon.style.cursor = 'pointer'
      icon.setAttribute('type', 'modelIcon')
      icon.setAttribute('selfType', type)
      icon.style.position = 'absolute'
      if (callBack) {
        icon.addEventListener('click', () => {
          callBack(e, props)
        })
      }
      this.posList.push(pos3D)
      this.iconList.push(icon)
      model.appendChild(icon)
    })
  }

  updateViewer() {
    this.viewer.setUpdateCallback(() => {
      this.iconList.forEach((icon, i) => {
        let position2D = this.viewer.getCamera().project(this.posList[i])
        icon.style.left = position2D[0] + 'px'
        icon.style.top = position2D[1] + 'px'
      })
    })
  }

  clearIcon(domId, type) {
    let model = document.getElementById(domId)
    let imgs = model.getElementsByTagName('img')
    if (!imgs || !imgs.length) {
      return
    }
    if (type) {
      for (let i = imgs.length - 1; i >= 0; i--) {
        if (imgs[i].getAttribute('selfType') === type) {
          imgs[i].remove()
        }
      }
      return
    }
    for (let i = imgs.length - 1; i >= 0; i--) {
      if (imgs[i].getAttribute('type') === 'modelIcon') {
        imgs[i].remove()
      }
    }
  }

  setMark(props) {
    this.renderIcon(props)
    this.updateViewer()
  }
}
