/**
 * text3D管理类
 */
export default class TextManager {
  constructor(options) {
    this.viewer = options.viewer
  }

  addText(options) {
    let id = options.id
    let content = options.content
    let translation = options.translation
    if (!id || !content || !translation) {
      throw new Error('addText缺少id或content或translation')
    }

    let scaleArr = [3.0, 3.0, 3.0]
    if (options.scaleArr) {
      scaleArr = options.scaleArr
    }

    let color = [1, 0.3, 0.2]
    if (options.color) {
      color = options.color
    }

    let text = new Modelo.View.Text3DBillboard(id, this.viewer.getResourceManager(), this.viewer.getMaterialManager())
    text.setContent(content)
    text.setTranslation(translation[0], translation[1], translation[2])
    text.setScaling(scaleArr[0], scaleArr[1], scaleArr[2])
    text.setColor(color)
    text.setFaceCameraZ(true)
    this.viewer.getScene().addText3D(text, false)
  }

  deleteTextById(id) {
    if (!id) {
      throw new Error('deleteTextById缺少id')
    }

    let text3dArr = this.viewer.getScene().core.text3Ds
    text3dArr.map(text3d => {
      if (text3d.name === id) {
        this.viewer.getScene().removeText3D(text3d)
      }
    })
  }

  deleteTextByReg(reg) {
    if (!reg) {
      throw new Error('deleteTextByReg缺少正则表达式')
    }
    let pattern = reg

    let text3dArr = this.viewer.getScene().core.text3Ds
    text3dArr.map(text3d => {
      if (pattern.test(text3d.name)) {
        this.viewer.getScene().removeText3D(text3d)
      }
    })
  }

  deleteAllText() {
    let text3dArr = this.viewer.getScene().core.text3Ds
    text3dArr.map(text3d => {
      this.viewer.getScene().removeText3D(text3d)
    })
  }
}
