import { GLTFLoader } from './GLTFLoader'
import { OrbitControls } from './OrbitControls.js'

export default class ViewCube {
  constructor(options) {
    this.viewer = options.viewer
    this.container = null
    this.scene = null
    this.camera = null
    this.loader = null
    this.renderer = null
    this.init()
  }

  init() {
    this.container = document.createElement('div')
    document.body.appendChild(this.container)

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20)
    this.camera.position.set(0, 0, 0)

    this.loader = new GLTFLoader()
    this.loader.load(
      'lib/nav.glb',
      gltf => {
        console.log(gltf)
        this.scene.add(gltf.scene)
      },
      undefined,
      error => {
        console.error(error)
      }
    )

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(200, 200)
    this.renderer.gammaOutput = true
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '10px'
    this.renderer.domElement.style.right = '10px'
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, -0.2, -0.2)
    this.controls.update()

    this.renderer.render(this.scene, this.camera)
    // window.addEventListener('resize', this.onWindowResize(), false)

    this.animate()
  }

  animate() {
    requestAnimationFrame(this.animate())

    this.renderer.render(this.scene, this.camera)
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
