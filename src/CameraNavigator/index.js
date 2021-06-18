export default class CameraNavigator {
  constructor(options) {
    this.viewer = options.viewer
    this.cameraNavigator = new Modelo.View.Tool.CameraNavigator(this.viewer)
    this.pointAry = []
  }
  start(pointAry, speed = 0.5, duration = 20) {
    if (!pointAry || !pointAry.length) {
      return
    }
    this.pointAry = pointAry
    this.cameraNavigator.setSpeed(speed)
    this.cameraNavigator.setRotationDuration(duration)
    this.cameraNavigator.clearKeyPoints()
    this.pointAry.forEach(p => {
      this.cameraNavigator.addKeyPoint(p)
    })
    this.cameraNavigator.start()
  }

  stop() {
    this.cameraNavigator.stop()
    this.pointAry = []
  }
}
