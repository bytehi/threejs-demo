import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

console.log('Three', THREE)

// 初始化场景
const scene = new THREE.Scene()

// 初始化相机
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)
// 设置相机位置
camera.position.set(0, 0, 1)
// 更新摄像头宽高比例
camera.aspect = window.innerWidth / window.innerHeight
// 更新摄像头投影矩阵
camera.updateProjectionMatrix()
// 将相机添加至场景
scene.add(camera)



class Geometry {
  constructor() {

  }
}

// 创造物体
const cubeGeometry = new THREE.BoxGeometry(10, 10, 10)
// 创建材质
// const  cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
// const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
// // 将物体添加至场景
// scene.add(cubeMesh)

const colors = [
    { color: 0xff0000 },
    { color: 0x00ff00 },
    { color: 0x0000ff },
    { color: 0xff00ff },
    { color: 0xffff00 },
    { color: 0x00ffff }
]
const cubeMaterials = []
// 将6个面涂上不同的颜色
for(let i=0, len = colors.length; i<len; i++) {
    cubeMaterials.push(new THREE.MeshBasicMaterial(colors[i]))
}
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterials)
// 将物体添加至场景
scene.add(cubeMesh)



// 初始化渲染器
const renderer = new THREE.WebGLRenderer({
  // 设置抗锯齿
  antialias: true,
})
renderer.outputEncoding = THREE.sRGBEncoding;
// 设置渲染器宽高
renderer.setSize(window.innerWidth, window.innerHeight)
// 将渲染器添加到页面
document.body.appendChild(renderer.domElement)


// 实例化控制器
const controls = new OrbitControls(camera, renderer.domElement)
// 启用惯性
controls.enableDamping = true
// 相机向外移动极限
// controls.maxDistance = 4.5


// 自动渲染
function render() {
  // 渲染场景
  renderer.render(scene, camera)
  // 引擎自动更新渲染器
  requestAnimationFrame(render)
}
render()

window.addEventListener('resize', () => {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像机的投影矩阵
  camera.updateProjectionMatrix();
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio)
})