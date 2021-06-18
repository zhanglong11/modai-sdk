import ExplodeManager from './ExplodeManager'
import ModelCompare from './ModelCompare'
import MarkManger from './MarkManager'
import MeasureManager from './MeasureManager'
import SectionManager from './SectionManager'
import TextManager from './TextManager'
import CameraNavigator from './CameraNavigator'
import RibbonManager from './RibbonManager'
import CircleManager from './CircleManager'
import AnimatingStripeManager from './AnimatingStripeManager'
import PromiseWorker from '../lib/promise-worker'

export default class BimfishModelo {
  constructor(domId) {
    this.domId = domId
    this.appToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTI1LCJ1c2VybmFtZSI6ImJpbXV5dSIsImlzUGVybWFuZW50Ijp0cnVlLCJpYXQiOjE1NjA0MTE4OTAsImV4cCI6MzMwOTY0MTE4OTB9.dgURCUb7VoECsDokXOFOx8zxdjwFzSIEFGC0zjASDGw'
    this.viewer = null

    this.mouseInput = null
    this.selectElementTool = null
    this.lastSelectElement = null

    this.explodeManagerObject = null
    this.modelCompareObject = null
    this.measureManagerObject = null
    this.sectionManagerObject = null
    this.textManagerObject = null
    this.ribbonObject = null
    this.cirecleObject = null
    this.animatingStripeObject = null

    this.MEASURETYPE = {
      LINES: 1,
      LINE: 2,
      LINESTRIP: 3,
      LINEFAN: 4,
      ANGEL: 5,
      AREA: 6
    }

    this.MEASUREUNIT = {
      M: 1,
      CM: 2,
      FEET: 3,
      INCHES: 4
    }

    this.modelId = null

    this.selectElements = []
  }

  /**
   * @description 模袋初始化
   * @author XMJ
   */
  init() {
    if (!this.domId || !this.appToken) {
      return
    }
    if (this.viewer) {
      this.destroy()
    }
    Modelo.init({ endpoint: 'https://build-portal.modeloapp.com', appToken: this.appToken })

    this.viewer = new Modelo.View.Viewer3D(this.domId, {
      isMobile: isMobile()
    })
  }

  /**
   * @description 返回viewer
   * @author XMJ
   */
  getViewer() {
    return this.viewer
  }

  /**
   * @description 销毁场景
   * @author XMJ
   */
  destroy() {
    if (this.viewer) {
      this.viewer.destroy()
      this.viewer = null
    }
  }

  /**
   * @description 加载模型，支持回调
   * @author XMJ
   * @param {String} modelId
   * @param {String} modelLocalUrl
   * @param {Object} cameraInfo //视角
   * @param {Function} callback
   */
  loadModel(props) {
    const { modelId, modelLocalUrl, cameraInfo, callback } = props
    if (!modelId) return
    if (!this.viewer) return
    this.modelId = modelId
    //记载缓存
    if (modelLocalUrl) {
      this.viewer
        .loadModel(
          modelId,
          {
            onProgress: progress => {
              // // second parameter is an optional progress callback
              // let c = document.getElementById('progress')
              // c.innerHTML = 'Loading: ' + Math.round(progress * 100) + '%'
            },
            cameraInfo
          },
          true,
          true,
          modelLocalUrl
        )
        .then(modelId => {
          // model loaded successfully
          // 初始化类及事件
          this.initFrame()
          if (callback) {
            callback(modelId)
          }
        })
      return
    }

    this.viewer
      .loadModel(modelId, progress => {
        // second parameter is an optional progress callback
        // let c = document.getElementById('progress')
        // c.innerHTML = 'Loading: ' + Math.round(progress * 100) + '%'
      })
      .then(modelId => {
        // model loaded successfully
        // 初始化类及事件
        this.initFrame()
        if (callback) {
          callback(modelId)
        }
      })
  }

  // /**
  //  * @description 加载模型，支持回调
  //  * @author XMJ
  //  * @param {String} modelId
  //  * @param {Function} callback
  //  */
  // loadModel(modelId, callback) {
  //   if (!modelId) return
  //   if (!this.viewer) return
  //   this.modelId = modelId
  //   this.viewer
  //     .loadModel(modelId, progress => {
  //       // second parameter is an optional progress callback
  //       let c = document.getElementById('progress')
  //       c.innerHTML = 'Loading: ' + Math.round(progress * 100) + '%'
  //     })
  //     .then(modelId => {
  //       // model loaded successfully
  //       // 初始化类及事件
  //       this.initFrame()
  //       if (callback) {
  //         callback(modelId)
  //       }
  //     })
  // }

  /**
   * @description 初始化类及事件
   */
  initFrame() {
    this.mouseInput = new Modelo.View.Input.Mouse(this.viewer)
    this.viewer.addInput(this.mouseInput)
    this.viewer.addInput(new Modelo.View.Input.Touch(this.viewer))
    this.viewer.addInput(new Modelo.View.Input.Keyboard(this.viewer))

    this.measureManagerObject = new MeasureManager({ viewer: this.viewer })
    this.sectionManagerObject = new SectionManager({ viewer: this.viewer })
    this.textManagerObject = new TextManager({ viewer: this.viewer })
    this.cameraNavigatorObject = new CameraNavigator({ viewer: this.viewer })
    this.ribbonObject = new RibbonManager({ viewer: this.viewer })
    this.cirecleObject = new CircleManager({ viewer: this.viewer })
    this.animatingStripeObject = new AnimatingStripeManager({ viewer: this.viewer })

    this.selectElementTool = new Modelo.View.Tool.SelectElements(this.viewer)
    this.viewer.addTool(this.selectElementTool)

    this.initViewCube()

    // this.viewCube = new ViewCube({ viewer: this.viewer })

    // this.viewer.getEventEmitter().on('onPointPicked', point => {
    //   console.log(point)
    // })
    // add keyboard callback.
    // let keyboard = new Modelo.View.Input.Keyboard(this.viewer)
    // this.viewer.addInput(keyboard);
    // keyboard.addKeyUpListener(keyboard => {
    //   if (keyboard.key === 27) {
    //     this.viewer.destroy();
    //   }
    // })
  }

  /**
   * @description 鼠标获取点击的三维点和二维点
   * @author XMJ
   * @param {Function} callback
   */
  mousePickPosition(callback) {
    this.mouseInput.addMouseUpListener(e => {
      let pos3d = this.viewer.getCamera().unproject(e.x, e.y)
      if (callback) {
        callback(e, pos3d)
      }
      // if (!pos3d) return
      // let pixel2d = this.viewer.getCamera().project(pos3d)
      // if (pixel2d) {
      //   pixel2d[0] = Math.round(pixel2d[0])
      //   pixel2d[1] = Math.round(pixel2d[1])
      // }
      // console.log(pixel2d)
    })
  }

  /**
   * @description 开启模型分解
   * @author XMJ
   * @param {Array} elementGroupNames [[1,2,3], [4,5,6]]
   * @param {Array} explodeScale 缩放间距比例
   */
  startExplode(elementGroupNames, explodeScale) {
    if (!this.explodeManagerObject) {
      this.explodeManagerObject = new ExplodeManager({ viewer: this.viewer })
    }
    this.explodeManagerObject.startExplode(elementGroupNames, explodeScale)
  }

  /**
   * @description 关闭模型分解
   * @author XMJ
   */
  endExplode() {
    if (this.explodeManagerObject) {
      this.explodeManagerObject.endExplode()
    }
  }

  /**
   * @description 模型隐藏显示
   * @param visible 显示隐藏
   */
  setModelVisible(visible) {
    if (!this.modelId) {
      return
    }
    this.viewer.getScene().setModelVisibility(this.modelId, visible)
  }

  pickOnlySelect(color = [1, 0, 0], isClose = false, callback) {
    this.selectElementTool.setEnabled(true)
    this.selectElementTool.setCloseUpEnabled(isClose)
    // console.log(this.selectElementTool)
    // this.selectElementTool.setOverridedColor([1, 1, 1, 0.8])
    this.selectElementTool.setHighlightEnabled(false)

    this.pickOnlySelectEvent = elName => {
      if (elName.length === 0) {
        console.log('none is selected')
      } else {
        if (this.lastSelectElement) {
          this.viewer.getScene().setElementsColor(this.lastSelectElement, null)
          this.lastSelectElement = null
        }
        this.viewer.getScene().setElementsColor(elName, color)
        this.lastSelectElement = elName

        this.selectElements = elName
      }

      if (callback) {
        callback(elName)
      }
    }

    this.viewer.getEventEmitter().on('onElementSelected', this.pickOnlySelectEvent)
  }

  pickOnlyUnSelect() {
    this.selectElementTool.setEnabled(false)
    this.selectElementTool.setCloseUpEnabled(true)
    this.selectElementTool.setHighlightEnabled(true)
    if (this.lastSelectElement) {
      this.viewer.getScene().setElementsColor(this.lastSelectElement, null)
      this.lastSelectElement = null
    }
    this.selectElements = []

    this.viewer.getEventEmitter().remove('onElementSelected', this.pickOnlySelectEvent)
    this.pickOnlySelectEvent = null
  }
  /**
   *@description 设置可选中构件，屏蔽，暂时不用
   */
  // setChoose() {
  //   this.selectElementTool.setEnabled(true)
  // }

  /**
   *@description 设置不可选中构件，屏蔽，暂时不用
   */
  // setUnChoose() {
  //   this.pickElement()
  //   this.switchView()
  //   this.selectElementTool.setEnabled(false)
  // }

  /**
   * @description 选中构件
   * @param eleAry 构件id数组
   */
  pickElement(eleAry = []) {
    this.selectElementTool.setEnabled(true)
    this.selectElementTool.pick(eleAry, true)
    this.selectElements = eleAry
  }

  /**
   * @description 框选
   * @param {Function} callback 回调
   */
  regionSelect(callback) {
    this.selectElementTool.setEnabled(true)
    this.selectElementTool.setRegionSelectEnabled(true)

    this.regionSelectEvent = elName => {
      if (elName.length === 0) {
        console.log('none is selected')
      } else {
        if (this.lastSelectElement) {
          this.viewer.getScene().setElementsColor(this.lastSelectElement, null)
          this.lastSelectElement = null
        }
        this.selectElements = elName
      }

      if (callback) {
        callback(elName)
      }
    }
    this.viewer.getEventEmitter().on('onElementSelected', this.regionSelectEvent)
  }

  /**
   * @description 禁止框选
   */
  regionUnSelect() {
    this.pickElement()
    this.switchView()
    this.selectElementTool.setEnabled(false)
    this.selectElementTool.setRegionSelectEnabled(false)

    this.selectElements = []

    this.viewer.getEventEmitter().remove('onElementSelected', this.regionSelectEvent)
    this.regionSelectEvent = null
  }

  /**
   * @description 获取选中构件
   */
  getSelectElements() {
    return this.selectElements
  }

  /**
   * @description 构件上色
   * @param eleAry 构件id数组
   * @param color 颜色
   */
  setElementsColor(eleAry = [], color = []) {
    console.log(color)
    if (!color) {
      this.viewer.getScene().setElementsColor(eleAry, null)
      return
    }
    this.viewer.getScene().setElementsColor(eleAry, [color[0] / 255, color[1] / 255, color[2] / 255])
  }

  /**
   * @description 清除构件颜色
   * @param eleAry 构件id数组
   */
  clearElementsColor(eleAry = []) {
    this.viewer.getScene().setElementsColor(eleAry, null)
  }

  /**
   * @description 构件隐藏显示
   * @param eleAry 构件id数组
   * @param visible 显示隐藏
   */
  setElementsVisible(eleAry = [], visible) {
    this.viewer.getScene().setElementsVisibility(eleAry, visible)
  }

  /**
   * @description 获取构件属性
   * @param eleAry 构件id
   */
  getElementsProperties(eleAry) {
    return Modelo.BIM.getElementsProperties(this.modelId, eleAry).then(res => {
      return res
    })
  }

  /**
   * @description 开启模型对比
   * @author XMJ
   * @param {String} leftModelId
   * @param {String} rightModelId
   */
  startModelCompare(leftModelId, rightModelId) {
    if (!this.modelCompareObject) {
      this.modelCompareObject = new ModelCompare({
        domId: this.domId,
        viewer: this.viewer
      })
    }
    this.modelCompareObject.initModelCompare()
    this.modelCompareObject.modelCompare(leftModelId, rightModelId)
  }

  /**
   * @description 关闭模型对比
   * @author XMJ
   */
  endModelCompare() {
    if (this.modelCompareObject) {
      this.modelCompareObject.destroyModelCompare()
    }
  }

  /**
   * @description 空间坐标转屏幕坐标
   * @param modelPosition  [0, 0, 0]
   */
  screenCoordinate(modelPosition) {
    if (!modelPosition) return
    return this.viewer.getCamera().project(modelPosition)
  }

  /**
   * @description 屏幕坐标转空间坐标
   * @param modelPosition  [0, 0]
   */
  spaceCoordinate(modelPosition) {
    if (!modelPosition) return
    return this.viewer.getCamera().unproject(modelPosition[0], modelPosition[1])
  }

  /** @description 设置标注
   * @param eleAry 构件id数组
   * @param imgSrc 标注地址
   * @param type 设置标注图片
   * @param size 标注大小
   * @param callBack 标注点击方法
   */
  // setMark(eleAry, imgSrc, type, size = 20, callBack) {
  //   if (!this.markManager) {
  //     this.markManager = new MarkManger({ viewer: this.viewer })
  //   }
  //   this.markManager.setMark(this.domId, eleAry, imgSrc, type, size, callBack)
  // }

  setMark(props) {
    if (!this.markManager) {
      this.markManager = new MarkManger({ viewer: this.viewer })
    }
    this.markManager.setMark({ domId: this.domId, ...props })
  }

  /**
   * @description 清除标注
   * @param type 清除标注类型，不设置清除所有
   */
  clearMark(type) {
    if (!this.markManager) {
      return
    }
    this.markManager.clearIcon(this.domId, type)
  }

  /**
   * @description 设置测量单位
   * @author XMJ
   * @param {Number} unit 传入MEASUREUNIT其中某个类型
   */
  setMeasureUnit(unit) {
    if (this.measureManagerObject) {
      this.measureManagerObject.setMeasureUnit(unit)
    }
  }

  /**
   * @description 开始测量
   * @author XMJ
   * @param {Number} measureType 传入MEASURETYPE其中某个类型
   */
  startMeasure(measureType) {
    if (this.measureManagerObject) {
      this.measureManagerObject.startMeasure(measureType)
    }
  }

  /**
   * @description 测量结果
   */

  getMeasureData() {
    if (this.measureManagerObject) {
      return this.measureManagerObject.getMeasureData()
    }
  }

  /**
   * @description 结束测量
   * @author XMJ
   */
  endMeasure() {
    if (this.measureManagerObject) {
      this.measureManagerObject.endMeasure()
    }
  }

  /**
   * @description 切换视角
   * @direction 前:0,后:1,左:2,右:3,上:4,下:5,默认：6
   */
  switchView(direction = 6) {
    this.viewer.getCamera().switchToView(direction)
  }

  /**
   * @description 开始剖切
   * @author XMJ
   */
  startSection() {
    if (this.sectionManagerObject) {
      this.sectionManagerObject.startSection()
    }
  }

  /**
   * @description 是否显示剖切的Box以及是否交互
   * @param {Bool} enable
   */
  setSectionInteractive(enable) {
    if (this.sectionManagerObject) {
      this.sectionManagerObject.setSectionInteractive(enable)
    }
  }

  /**
   * @description 结束剖切
   * @author XMJ
   */
  endSection() {
    if (this.sectionManagerObject) {
      this.sectionManagerObject.endSection()
    }
  }

  /**
   * @description 添加文字
   * @author XMJ
   * @param {Object} options 包含id,content,translation,scaleArr,color;前3个是必备字段
   */
  addText(options) {
    if (this.textManagerObject) {
      this.textManagerObject.addText(options)
    }
  }

  /**
   * @description 根据ID删除文字
   * @author XMJ
   * @param {String} id
   */
  deleteTextById(id) {
    if (this.textManagerObject) {
      this.textManagerObject.deleteTextById(id)
    }
  }

  /**
   * @description 根据正则删除文字
   * @author XMJ
   * @param {pattern} reg
   */
  deleteTextByReg(reg) {
    if (this.textManagerObject) {
      this.textManagerObject.deleteTextByReg(reg)
    }
  }

  /**
   * @description 删除所有文字
   * @author XMJ
   */
  deleteAllText() {
    if (this.textManagerObject) {
      this.textManagerObject.deleteAllText()
    }
  }

  /**
   * @description 获取当前相机信息
   * @author XMJ
   */
  getCameraData() {
    return this.viewer.getCamera().getData()
  }

  /**
   * @description 设置相机信息
   * @author XMJ
   * @param {Object} data
   * @param {Boolean} animation
   */
  setCameraData(data, animation = true) {
    if (!data) return
    this.viewer.getCamera().setData(data, animation)
  }

  /**
   * @description 缩放至构件
   * @author XMJ
   * @param {Array} elArray
   * @param {Number} ratio
   */
  focusElements(elArray = [], ratio = 1) {
    this.viewer.focusElements(elArray, ratio)
  }

  /**
   * @description 截屏
   */
  dumpScreen(width = 960, height = 640) {
    return this.viewer.dumpScreen(width, height)
  }

  /**
   * @description 漫游
   * @speed 速度
   * @duration 镜头旋转速度
   */
  startCameraNavigator(pointAry, speed, duration) {
    if (!this.cameraNavigatorObject) {
      return
    }
    this.cameraNavigatorObject.start(pointAry, speed, duration)
  }

  /**
   * @description 停止漫游
   */
  stopCameraNavigator() {
    if (!this.cameraNavigatorObject) {
      return
    }
    this.cameraNavigatorObject.stop()
  }

  getElementProperties(modelId) {
    let elNameArray = this.viewer.getScene().getElementsNames()
    // let elNameArray2 = [elNameArray[0], elNameArray[1]]
    let promiseArr = []
    elNameArray.map(elName => {
      promiseArr.push(Modelo.BIM.getElementProperties(modelId, elName))
    })
    Promise.all(promiseArr)
      .then(result => {
        console.log(result)
      })
      .catch(error => {
        console.log(error)
      })
  }

  testWorker() {
    let worker = new Worker('lib/worker.js')
    let promiseWorker = new PromiseWorker(worker)

    let elNameArray = this.viewer.getScene().getElementsNames()
    // elNameArray.map(elName => {
    //   promiseWorker
    //     .postMessage({
    //       modelId: 'j1mZemYb',
    //       name: elName
    //     })
    //     .then(response => {
    //       // handle response
    //       console.log('response', response)
    //     })
    //     .catch(error => {
    //       // handle error
    //       console.log('error', error)
    //     })
    // })

    promiseWorker
      .postMessage({
        modelId: 'j1mZemYb',
        name: elNameArray[0]
      })
      .then(response => {
        // handle response
        console.log('response', response)
      })
      .catch(error => {
        // handle error
        console.log('error', error)
      })

    // promiseWorker
    //   .postMessage('ping')
    //   .then(response => {
    //     // handle response
    //     console.log('response', response)
    //   })
    //   .catch(error => {
    //     // handle error
    //     console.log('error', error)
    //   })
  }

  /**
   * @description 隔离
   * @param eleAry 构件id数组
   */
  partElements(eleAry) {
    this.setModelVisible(false)
    this.setElementsVisible(eleAry, true)
  }

  /**
   * @description 反向隔离
   * @param eleAry 构件id数组
   */
  partEnableElements(eleAry) {
    this.setModelVisible(true)
    this.setElementsVisible(eleAry, false)
  }

  /**
   * @description 阴影
   * @param visible
   */
  shadowButton(visible) {
    this.viewer.setShadowEnabled(visible)
  }
  ambientShadow(visible) {
    this.viewer.setEffectEnabled('SSAO', visible)
  }
  specularShadow(visible) {
    this.viewer.setSpecularEnabled(visible)
  }
  /**
   * @description 全局阴影范围维度
   * @param {Number} value 0-π/2
   */
  shadowRange(value) {
    this.viewer.setLightingLatitude(value)
  }
  /**
   * @description 全局阴影范围经度
   * @param {Number} value 0-2π
   */
  shadowRangeLong(value) {
    this.viewer.setLightingLongitude(value)
  }
  /**
   * @description 全局阴影亮度
   * @param {Number} value 0-1
   */
  shadowBrightness(value) {
    this.viewer.setLightingIntensity(value)
  }
  /**
   * @description 获取材质名称
   * @param elementName
   */
  getMaterialNames(elementName) {
    if (elementName) return this.viewer.getScene().getElementMaterialNames(elementName)
  }
  /**
   * @description 改变材质颜色
   * @param materialsNames 数组
   * @param randomColor 颜色
   */
  changeMaterialColor(materialsNames, randomColor) {
    let viewer = this.viewer
    if (materialsNames) {
      materialsNames.forEach(function(materialName) {
        // 对每个材质名称，设置其颜色值
        viewer.setMaterialParameter(materialName, 'color', randomColor)
      })
    }
  }
  /**
   * @description 材质颜色还原
   * @param
   */
  clearMaterialColor() {}
  /**
   * @description 贴图
   * @param materialNames 材质名数组
   * @param url 图片路径
   */
  changeMaterialImage(materialNames, url) {
    let viewer = this.viewer
    if (materialNames) {
      materialNames.forEach(function(materialName) {
        // 对每个材质名称，设置贴图, 传入参数为贴图路径
        viewer.setMaterialParameter(materialName, 'colorTexture', url)
      })
      this.selectElementTool.pick([], false)
    }
  }
  /**
   * @description 设置天空盒图片
   * @param {Array} cubeMapImages
   */
  setSkyBox(cubeMapImages) {
    if (!cubeMapImages || !Array.isArray(cubeMapImages) || cubeMapImages.length !== 6) return
    this.viewer.setBackgroundMode(Modelo.View.ViewBackground.CUBEMAP)
    this.viewer.setBackgroundImage(cubeMapImages)
  }

  /**
   * @description 设置背景颜色
   * @param {Array} color 颜色
   */

  setBackgroundColor(color = [1, 1, 1]) {
    this.viewer.setBackgroundColor(color)
  }

  /**
   * @description 清除天空盒
   */
  clearSkyBox() {
    this.viewer.setBackgroundMode(Modelo.View.ViewBackground.SOLIDCOLOR)
    this.viewer.setBackgroundColor([1.0, 1.0, 1.0])
  }

  /**
   * @description 设置构件发光
   * @param {Array} elements
   * @param {Array} glowColor
   * @param {Number} intensity
   */
  setElementsGlow(elements = [], glowColor = [0.0, 1.0, 0.0], intensity = 0.5) {
    this.viewer.setEffectEnabled('Glow', true)

    this.viewer
      .getRenderScene()
      .getEffect('Glow')
      .addElements(elements, {
        emissiveColor: glowColor
      })
    this.viewer.setEffectParameter('Glow', 'intensity', intensity)
  }

  /**
   * @description 清除发光
   */
  clearElementsGlow() {
    this.viewer.setEffectEnabled('Glow', false)
  }

  /**
   * @description 设置全局发光强度
   * @param {Number} intensity
   */
  setGlobeGlowIntensity(intensity = 0.5) {
    this.viewer.setEffectParameter('Glow', 'intensity', intensity)
  }

  /**
   * @description 设置反射贴图
   * @param {Array} images
   */
  setReflectionImages(images) {
    if (!images || !Array.isArray(images)) return
    this.viewer.setReflectionImages(images)
  }

  /**
   * @description 设置轮廓线
   * @param color 轮廓颜色
   */
  setContourLine(color) {
    this.viewer.setEffectEnabled('Sketch', true)
    this.viewer.setEffectParameter('Sketch', 'color', [color[0] / 255, color[1] / 255, color[2] / 255])
    this.viewer.setEffectParameter('Sketch', 'colored', true)
  }

  /**
   * @description 取消轮廓线
   */
  setCoutourLineNone() {
    this.viewer.setEffectEnabled('Sketch', false)
  }

  getElementCoordinates(eleId) {
    let pos3D = this.viewer.getScene().getElementsBBox(eleId)
    console.log(pos3D)
  }

  //设置流动线
  setRibbon() {
    let pathes = {
      path1: [
        [38.18899536132812, 2.2801859378814697, 16.108922958374023],
        [113.18899536132812, 2.2801859378814697, 16.108922958374023],
        [230.18899536132812, 2.2801859378814697, 16.108922958374023]
      ],
      path2: [
        [38.18899536132812, 2.2801859378814697, 1.108922958374023],
        [113.18899536132812, 2.2801859378814697, 1.108922958374023],
        [230.18899536132812, 2.2801859378814697, 1.108922958374023]
      ],
      path3: [
        [38.18899536132812, 2.2801859378814697, 16.108922958374023],
        [113.18899536132812, 2.2801859378814697, 16.108922958374023],
        [230.18899536132812, 2.2801859378814697, 16.108922958374023]
      ],
      path4: [
        [38.18899536132812, 2.2801859378814697, 1.108922958374023],
        [113.18899536132812, 2.2801859378814697, 1.108922958374023],
        [230.18899536132812, 2.2801859378814697, 1.108922958374023]
      ]
    }
    if (this.ribbonObject) {
      this.ribbonObject.setRibbon(pathes, '../images/platte.png')
    }
  }

  clearRibbon() {
    if (this.ribbonObject) {
      this.ribbonObject.clearRibbon()
    }
  }

  setCircle() {
    if (this.cirecleObject) {
      this.cirecleObject.setCircle('../images/circular_03.png')
    }
  }

  clearCircle() {
    if (this.cirecleObject) {
      this.cirecleObject.clearCircle()
    }
  }

  setTransparent() {
    // this.viewer.setRenderingLinesEnabled(true)
    this.viewer.getCamera().setSensitivity({ touchPan: 0.9 })
    // this.viewer.setSmartCullingEnabled(false)
    // this.viewer.setSpecularEnabled(true)
    // this.viewer.setBackgroundColor([26.0 / 255.0, 26.0 / 255.0, 55.0 / 255.0, 1.0])
    this.viewer.setEffectEnabled('Sketch', true)
    this.viewer.setEffectParameter('Sketch', 'color', [0 / 255.0, 255 / 255.0, 255 / 255.0])
    this.viewer.setEffectParameter('Sketch', 'colored', true)
    this.viewer.setEffectParameter('Sketch', 'transparents', true)
    this.viewer.setEffectParameter('Sketch', 'contrast', 25)
    // this.viewer.setEffectParameter('Sketch', 'detail', 10)
  }

  /**
   * @description 设置渐变线
   * @param {String} id
   * @param {Object} pathes
   * @param {Object} options
   */
  setAnimatingStripe(id, pathes, options) {
    if (this.animatingStripeObject) {
      this.animatingStripeObject.setAnimatingStripe(id, pathes, options)
    }
  }

  /**
   * @description 根据id删除指定渐变线
   * @param {String} id
   */
  removeAnimatingStripeById(id) {
    if (this.animatingStripeObject) {
      this.animatingStripeObject.removeAnimatingStripeById(id)
    }
  }

  /**
   * @description 选中高亮
   */
  setHighlightEnabled(enable) {
    this.selectElementTool.setHighlightEnabled(enable)
  }

  /**
   * @description 清空渐变线
   */
  clearAnimatingStripe() {
    if (this.animatingStripeObject) {
      this.animatingStripeObject.clearAnimatingStripe()
    }
  }

  /**
   * @description 初始化导航窗体
   */
  initViewCube() {
    let oBox = document.querySelector('#cubeBox')

    let cameraData = this.viewer.getCamera().getData()
    console.log(cameraData)

    let y = (cameraData.theta * 180) / Math.PI || 0
    let x = -(cameraData.phi * 180) / Math.PI || 0

    //设置初始角度
    oBox.style.transform = 'perspective(800px) rotateX(' + x + 'deg) rotateY(' + y + 'deg)'

    // 移动场景操作立方体
    this.mouseInput.addMouseDownListener(downEv => {
      this.mouseInput.addMouseMoveListener(moveEv => {
        let moveCameraData = this.viewer.getCamera().getData()
        // console.log(moveCameraData)
        let moveY = (moveCameraData.theta * 180) / Math.PI || 0
        let moveX = -(moveCameraData.phi * 180) / Math.PI || 0

        //设置初始角度
        oBox.style.transform = 'perspective(800px) rotateX(' + moveX + 'deg) rotateY(' + moveY + 'deg)'
      })
    })

    // 双击面切换视角
    oBox.ondblclick = ev => {
      let type = ev.target.className
      console.log(type)
      switch (type) {
        case 'front':
          oBox.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'
          bimfishModeloApp.switchView(0)
          break
        case 'back':
          oBox.style.transform = 'perspective(800px) rotateX(0deg) rotateY(180deg)'
          bimfishModeloApp.switchView(1)
          break
        case 'top':
          oBox.style.transform = 'perspective(800px) rotateX(-90deg) rotateY(-90deg)'
          bimfishModeloApp.switchView(4)
          break
        case 'bottom':
          oBox.style.transform = 'perspective(800px) rotateX(90deg) rotateY(180deg)'
          bimfishModeloApp.switchView(5)
          break
        case 'left':
          oBox.style.transform = 'perspective(800px) rotateX(0deg) rotateY(90deg)'
          bimfishModeloApp.switchView(2)
          break
        case 'right':
          oBox.style.transform = 'perspective(800px) rotateX(0deg) rotateY(-90deg)'
          bimfishModeloApp.switchView(3)
          break
        default:
          bimfishModeloApp.switchView(6)
      }
    }

    // 移动viewCube, 控制相机移动
    oBox.onmousedown = ev => {
      let oEvent = ev || event
      let disX = oEvent.clientX - y
      let disY = oEvent.clientY - x
      document.onmousemove = ev => {
        let oEvent2 = ev || event
        x = oEvent2.clientY - disY
        y = oEvent2.clientX - disX
        oBox.style.transform = 'perspective(800px) rotateX(' + x + 'deg) rotateY(' + y + 'deg)'

        let phi = (x * Math.PI) / 180
        let theta = (y * Math.PI) / 180
        let currentCameraData = this.viewer.getCamera().getData()

        let tempCameraData = {
          at: currentCameraData.at,
          distance: currentCameraData.distance,
          fov: currentCameraData.fov,
          phi: -phi,
          theta: -theta
        }
        this.viewer.getCamera().setData(tempCameraData)
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
      return false
    }
  }
}

window.BimfishModelo = BimfishModelo
