/**
 * 模型分解类
 */
export default class ExplodeManager {
  constructor(options) {
    this.viewer = options.viewer
  }

  getCenter(bbox) {
    if (!bbox) return
    return [(bbox[0] + bbox[3]) / 2.0, (bbox[1] + bbox[4]) / 2.0, (bbox[2] + bbox[5]) / 2.0]
  }

  startExplode(elementGroupNames, explodeScale) {
    if (!elementGroupNames || !Array.isArray(elementGroupNames)) {
      return
    }
    if (!explodeScale) {
      explodeScale = 3.0
    }
    let elementNames = _.flattenDeep(elementGroupNames)
    let bigBBox = this.viewer.getScene().getElementsBBox(elementNames)

    let bigCenter = this.getCenter(bigBBox)

    let tempElementArr = [],
      tempOffsetArr = []
    for (let i = 0; i < elementNames.length; i++) {
      tempElementArr.push([elementNames[i]])

      let elementBBox = this.viewer.getScene().getElementBBox(elementNames[i])
      let elementCenter = this.getCenter(elementBBox)

      let xOffset = (elementCenter[0] - bigCenter[0]) * explodeScale
      let yOffset = (elementCenter[1] - bigCenter[1]) * explodeScale
      let zOffset = (elementCenter[2] - bigCenter[2]) * explodeScale
      tempOffsetArr.push([xOffset, yOffset, zOffset])
    }
    this.viewer.enterExplodedView(tempElementArr, tempOffsetArr)
  }

  endExplode() {
    this.viewer.quitExplodedView()
  }
}
