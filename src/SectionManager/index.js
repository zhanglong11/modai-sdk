export default class SectionManager {
  constructor(options) {
    this.viewer = options.viewer
    this.section = null

    this.init()
  }

  init() {
    this.viewer.setSmartCullingEnabled(false)

    this.section = new Modelo.View.Tool.Section(this.viewer)
    this.viewer.addTool(this.section)
  }

  startSection() {
    this.section.setEnabled(true)
    this.section.setInteractive(true)
    this.viewer.invalidate()
  }

  endSection() {
    this.section.setEnabled(false)
    this.viewer.invalidate()
  }

  setSectionInteractive(enable) {
    if (this.section) {
      this.section.setInteractive(enable)
      this.viewer.invalidate()
    }
  }

  resetSectionBox() {
    if (this.section) {
      this.section.reset()
      this.viewer.invalidate()
    }
  }
}
