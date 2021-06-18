export default class AnimatingStripeManager {
  constructor(options) {
    this.viewer = options.viewer
    this.stripeArr = []

    this.init()
  }

  init() {
    this.viewer.setLazyRenderingEnabled(false)
  }

  setAnimatingStripe(id, pathes, options) {
    if (!id || !pathes || !options.image) return

    let width = options.width || 50
    let unitLenght = options.unitLenght || 50000
    let speed = options.speed || 0.4

    let stripe = new Modelo.View.Visualize.AnimatingStripe(this.viewer.getRenderScene())
    stripe.setEnabled(true)
    this.viewer.getScene().addVisualize(stripe)

    stripe.setParameter('width', width)
    stripe.setParameter('unitLenght', unitLenght)
    stripe.setParameter('speed', speed)
    stripe.setParameter('platteTexture', options.image)

    for (var key in pathes) {
      let path = pathes[key]
      // path.forEach(point => {
      //   //meter to feet.
      //   point[0] = point[0] * 3.2808
      //   point[1] = point[1] * 3.2808
      //   point[2] = point[2] * 3.2808 + 30
      // })
      stripe.addStripe(path)
    }

    this.stripeArr.push({
      id: id,
      stripe: stripe
    })
  }

  removeAnimatingStripeById(id) {
    if (!id) return

    this.stripeArr.map((stripeObj, index) => {
      if (stripeObj.id === id) {
        this.viewer.getScene().removeVisualize(stripeObj.stripe)
        this.stripeArr.splice(index, 1)
      }
    })
  }

  clearAnimatingStripe() {
    this.stripeArr.map(stripeObj => {
      this.viewer.getScene().removeVisualize(stripeObj.stripe)
    })

    this.stripeArr = []
  }
}
