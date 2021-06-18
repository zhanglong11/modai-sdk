export default class RibbonManager {
  constructor(options) {
    this.viewer = options.viewer
    this.circle = null
  }

  setCircle(imgPath) {
    this.viewer.setEffectEnabled('Glow', true)
    this.viewer.setLazyRenderingEnabled(false)
    this.circle = new Modelo.View.Pawn('circle1', this.viewer.getResourceManager(), this.viewer.getMaterialManager())
    let image_circle = new Image()
    image_circle.src = imgPath
    image_circle.onload = () => {
      this.circle.createTexturedQuad(image_circle)
      this.circle.setScaling(200, 200, 1)
      this.circle.setTranslation(115, 63, 0)
      this.viewer.getScene().addPawn(this.circle, false)
      this.viewer
        .getRenderScene()
        .getEffect('Glow')
        .addPawn(this.circle)
      setInterval(() => {
        this.circle.rotate(0.01, [0, 0, 1], [115, 63, 0])
      }, 10)
    }
  }

  clearCircle() {
    this.viewer.getScene().removePawn(this.circle)
  }
}
