/**
 * 模型对比类
 */
export default class ModelCompare {
  constructor(options) {
    this.domId = options.domId
    this.viewer = options.viewer

    this.inputId = -1
    this.selectElementTool = null
    this.loadingDone1 = false
    this.loadingDone2 = false

    this.compareData = {}
  }

  getModelCompareData() {
    return this.compareData
  }

  initModelCompare() {
    if (this.viewer) {
      this.viewer.destroy()
      this.viewer = null
    }

    this.viewer = new Modelo.View.Viewer3DCompare(this.domId)
    this.inputId = this.viewer.addInput(new Modelo.View.Input.Mouse(this.viewer))

    this.selectElementTool = new Modelo.View.Tool.SelectElements(this.viewer)
    this.selectElementTool.setEnabled(true)

    this.viewer.getCamera().setSplitPercentage(0.5)
  }

  destroyModelCompare() {
    if (this.viewer) {
      // if (this.inputId > -1) {
      //   this.viewer.removeInput(this.inputId)
      //   this.inputId = -1
      // }

      // this.viewer.removeTool(this.selectElementTool.name)
      // this.selectElementTool = null
      this.loadingDone1 = false
      this.loadingDone2 = false
      this.compareData = {}
      this.viewer.destroy()
      this.viewer = null
    }
  }

  setElementsColor(data) {
    let elements1 = {}
    let elements2 = {}
    data.newElements1.forEach(elementId => {
      if (!elements1[elementId]) {
        elements1[elementId] = 1
      }
    })
    data.newElements2.forEach(elementId => {
      if (!elements2[elementId]) {
        elements2[elementId] = 1
      }
    })
    data.modifiedElements1.forEach(elementId => {
      if (!elements1[elementId]) {
        elements1[elementId] = 1
      }
    })
    data.modifiedElements2.forEach(elementId => {
      if (!elements2[elementId]) {
        elements2[elementId] = 1
      }
    })

    let pickElements1 = Object.keys(elements1)
    let pickElements2 = Object.keys(elements2)
    this.viewer.focusElementsInViewport(0, pickElements1, false)
    this.viewer.focusElementsInViewport(1, pickElements2, false)
    this.viewer.getScene().cores[0].setElementsColor(data.newElements1, [1, 0, 0])
    this.viewer.getScene().cores[1].setElementsColor(data.newElements2, [0, 1, 0])
    this.viewer.getScene().cores[0].setElementsColor(data.modifiedElements1, [0, 0, 1])
    this.viewer.getScene().cores[1].setElementsColor(data.modifiedElements2, [1, 1, 0])
  }

  modelCompare(leftModelId, rightModelId) {
    if (!this.viewer) return
    if (!leftModelId || !rightModelId) {
      throw new Error('modelCompare缺少leftModelId或rightModelId')
    }

    this.viewer
      .loadModelAtViewport(leftModelId, 0, null)
      .then(() => {
        // success
        console.log('leftModelId loading done')
        if (this.loadingDone2) {
          return Modelo.Model.compare(leftModelId, rightModelId)
        }
        this.loadingDone1 = true
      })
      .then(data => {
        if (data) {
          this.setElementsColor(data)
        }
      })
      .catch(e => {})

    this.viewer
      .loadModelAtViewport(rightModelId, 1, null)
      .then(() => {
        // success
        console.log('rightModelId loading done')
        if (this.loadingDone1) {
          return Modelo.Model.compare(leftModelId, rightModelId)
        }
        this.loadingDone2 = true
      })
      .then(data => {
        if (data) {
          this.setElementsColor(data)
        }
      })
      .catch(e => {})
  }
}
