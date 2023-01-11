import * as THREE from 'three'
// import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// import stats from '../common/stats'
// import { listenResize } from '../common/utils'

// import foxGltf from './assets/models/Fox/glTF/Fox.gltf'

// Canvas
const canvas = document.querySelector('#mainCanvas')

// Scene
const scene = new THREE.Scene()

// Gui
const gui = new dat.GUI()
let surveyWeight = 0
let walkWeight = 0
let runWeight = 0

// Size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 4, 6)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.zoomSpeed = 0.3
controls.target = new THREE.Vector3(0, 3, 0)
controls.autoRotate = true

/**
 * Objects
 */
// plane
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15),
  new THREE.MeshStandardMaterial({
    color: '#607D8B',
  }),
)
plane.rotateX(-Math.PI / 2)
plane.receiveShadow = true
scene.add(plane)

/**
 * Models
 */
let model
let mixer
let skeleton
let actionSurvey
let actionWalk
let actionRun

const gltfLoader = new GLTFLoader()
// draco
// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader()

// Specify path to a folder containing WASM/JS decoding libraries.
dracoLoader.setDecoderPath('./assets/draco/')
// Optional: Pre-fetch Draco WASM/JS module.
dracoLoader.preload()
gltfLoader.setDRACOLoader(dracoLoader)


gltfLoader.load(
  // foxGltf,
  '../assets/models/Fox/glTF/Fox.gltf',
  // '../assets/models/Duck/glTF/Duck.gltf',
  // '../assets/models/Duck/glTF-Binary/Duck.glb',
  // './assets/models/Duck/glTF-Draco/Duck.gltf',
  // '../assets/models/FlightHelmet/glTF/FlightHelmet.gltf',
  (gltf) => {
    console.log('success')
    console.log(gltf)
    // gltf.scene.scale.set(10, 10, 10)
    // scene.add(gltf.scene)

    // duck
    // const duck = gltf.scene.children[0]
    // duck.children[1].castShadow = true
    // duck.position.set(0, -0.1, 0)
    // scene.add(duck)

    // fox
    model = gltf.scene
    model.scale.set(0.03, 0.03, 0.03)
    scene.add(model)

    // 遍历添加光影
    model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true
      }
    })

    skeleton = new THREE.SkeletonHelper(model)
    skeleton.visible = false
    scene.add(skeleton)

    // Animations
    mixer = new THREE.AnimationMixer(gltf.scene)
    actionSurvey = mixer.clipAction(gltf.animations[0])
    actionWalk = mixer.clipAction(gltf.animations[1])
    actionRun = mixer.clipAction(gltf.animations[2])
    actionWalk.setEffectiveWeight(0)
    actionRun.setEffectiveWeight(0)

    actionSurvey.play()
    actionWalk.play()
    actionRun.play()

    createGUIPanel()
  },
  (progress) => {
    console.log('progress')
    console.log(progress)
  },
  (error) => {
    console.log('error')
    console.log(error)
  },
)

/**
 * Light
 */
const directionLight = new THREE.DirectionalLight()
directionLight.castShadow = true
directionLight.position.set(5, 5, 6)
directionLight.shadow.camera.near = 1
directionLight.shadow.camera.far = 20
directionLight.shadow.camera.top = 10
directionLight.shadow.camera.right = 10
directionLight.shadow.camera.bottom = -10
directionLight.shadow.camera.left = -10

const directionLightHelper = new THREE.DirectionalLightHelper(directionLight, 2)
directionLightHelper.visible = false
scene.add(directionLightHelper)

const directionalLightCameraHelper = new THREE.CameraHelper(directionLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

const ambientLight = new THREE.AmbientLight(new THREE.Color('#ffffff'), 0.3)
scene.add(ambientLight, directionLight)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

let clock = new THREE.Clock()
let previousTime = 0;
// Animations
const tick = () => {
  // stats.begin()
  controls.update()

  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // update mixer
  if (mixer) {
    mixer.update(deltaTime)
    if (actionSurvey) {
      surveyWeight = actionSurvey.getEffectiveWeight()
    }
    if (actionWalk) {
      walkWeight = actionWalk.getEffectiveWeight()
    }
    if (actionRun) {
      runWeight = actionRun.getEffectiveWeight()
    }
    const animationFolder = gui.children[5]
    animationFolder.children[0].disable(surveyWeight !== 1);
    animationFolder.children[1].disable(walkWeight !== 1);
    animationFolder.children[2].disable(runWeight !== 1);
    animationFolder.children[3].disable(walkWeight !== 1)
  }

  // Render
  renderer.render(scene, camera)


  // stats.end()
  requestAnimationFrame(tick)
}

tick()

// listenResize(sizes, camera, renderer)


const createGUIPanel = () => {
  gui.add(directionLightHelper, 'visible').name('lightHelper visible')
  gui.add(directionalLightCameraHelper, 'visible').name('lightCameraHelper visible')
  gui.add(controls, 'autoRotate')
  gui.add(model, 'visible').name('model visible')
  gui.add(skeleton, 'visible').name('skeleton visible')

  const executeCrossFade = (
    startAction,
    endAction,
    duration = 1,
  ) => {
    if (!startAction || !endAction) return
    endAction.enabled = true
    endAction.time = 0
    endAction.setEffectiveTimeScale(1)
    endAction.setEffectiveWeight(1)
    startAction.crossFadeTo(endAction, duration, true)
  }

  const guiObj = {
    surveyToWalk: () => {
      executeCrossFade(actionSurvey, actionWalk)
    },
    walkToRun: () => {
      executeCrossFade(actionWalk, actionRun)
    },
    runToWalk: () => {
      executeCrossFade(actionRun, actionWalk)
    },
    walkToSurvey: () => {
      executeCrossFade(actionWalk, actionSurvey)
    },
  }

  const animationFolder = gui.addFolder('Animation')
  animationFolder.add(guiObj, 'surveyToWalk')
  animationFolder.add(guiObj, 'walkToRun')
  animationFolder.add(guiObj, 'runToWalk')
  animationFolder.add(guiObj, 'walkToSurvey')
}


