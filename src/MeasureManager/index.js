/**
 * 测量管理类
 */
export default class MeasureManager {
  constructor(options) {
    this.viewer = options.viewer

    this.currentRulerType = -1
    this.measureData = null

    // 顺序不能随意更改，因为外部传进来的MEASURETYPE是数组的索引值 + 1
    this.rulers = [
      new Modelo.View.Tool.MeasureLines(this.viewer),
      new Modelo.View.Tool.MeasureLine(this.viewer),
      new Modelo.View.Tool.MeasureLineStrip(this.viewer),
      new Modelo.View.Tool.MeasureLineFan(this.viewer),
      new Modelo.View.Tool.MeasureAngle(this.viewer),
      new Modelo.View.Tool.MeasureArea(this.viewer)
    ]

    this.init()
  }

  init() {
    for (let i = 0; i < this.rulers.length; i++) {
      this.viewer.addTool(this.rulers[i])
    }

    this.endMeasure()

    this.viewer.getEventEmitter().on('Measure-Update', args => {
      console.log('Measure-Update')
      this.measureData = args
      console.log(args)
    })

    this.viewer.getEventEmitter().on('Measure-DotUpdate', args => {
      console.log('Measure-DotUpdate')
    })
  }

  endMeasure() {
    for (let i = 0; i < this.rulers.length; i++) {
      this.rulers[i].setEnabled(false)
    }
    this.currentRulerType = -1
    this.measureData = null
  }

  setMeasureUnit(unit) {
    if (!unit) return
    switch (Number(unit)) {
      case 1:
        this.rulers[this.currentRulerType].setUnit('m')
        break
      case 2:
        this.rulers[this.currentRulerType].setUnit('cm')
        break
      case 3:
        this.rulers[this.currentRulerType].setUnit('feet')
        break
      case 4:
        this.rulers[this.currentRulerType].setUnit('inches')
        break
      default:
        this.rulers[this.currentRulerType].setUnit('m')
        break
    }
  }

  getMeasureData() {
    return this.measureData
  }

  startMeasure(measureType) {
    if (!measureType) return

    measureType = Number(measureType)

    this.endMeasure()

    this.rulers[measureType - 1].setEnabled(true)
    this.viewer.invalidate()

    this.currentRulerType = measureType - 1
  }
}
