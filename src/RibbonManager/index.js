export default class RibbonManager {
  constructor(options) {
    this.viewer = options.viewer
    this.ribbon = null
  }

  setRibbon(pathes, imgPath) {
    this.viewer.setLazyRenderingEnabled(false)
    this.ribbon = new Modelo.View.Visualize.AnimatingRibbon(this.viewer.getRenderScene())
    this.ribbon.setEnabled(true)
    this.viewer.getScene().addVisualize(this.ribbon)
    this.ribbon.setParameter('width', 5)
    this.ribbon.setParameter('unitLenght', 1000)
    this.ribbon.setParameter('speed', 1)
    this.ribbon.setParameter('platteTexture', imgPath)
    for (let key in pathes) {
      let path = pathes[key]
      this.ribbon.addRibbon(path)
    }
    this.viewer.setEffectParameter('Glow', 'intensity', 0.2)
  }

  clearRibbon() {
    this.ribbon.setEnabled(false)
  }
}
