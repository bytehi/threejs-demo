import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// // import WebVRPolyfill from '../source/webvr-polyfill.js';

// 在顶点着色器传递 uv
const vshader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

// 核心逻辑就是 vec2 uv = vUv * acept; 
const fshader = `
  varying vec2 vUv;

  uniform sampler2D u_tex;
  uniform vec2 acept;
  
  void main()
  {
    vec2 uv = vec2(0.5) + vUv * acept - acept*0.5;
    vec3 color = vec3(0.0);
    if (uv.x>=0.0 && uv.y>=0.0 && uv.x<1.0 && uv.y<1.0) color = texture2D(u_tex, uv).rgb;
    gl_FragColor = vec4(color, 1.0);
  }
`

const canvas = document.querySelector(".webgl");

const scene = new THREE.Scene();

// 相机
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 0, 5)
scene.add(camera);

// 添加光照
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)

scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(2, 2, -1)

scene.add(directionalLight)


const video = document.querySelector('#video');
const videoTexture = new THREE.VideoTexture(video);
console.log(videoTexture)

const uniforms = {
    u_tex: { value: videoTexture },
    acept: { value: new THREE.Vector2(1, 16/9)}
}

const geometry = new THREE.BoxGeometry(8, 4.5, 0.2);
const cubeMaterial = new THREE.ShaderMaterial({
    // color: '#ff0000',
    // map: texture
    uniforms: uniforms,
    vertexShader: vshader,
    fragmentShader: fshader
});
const cubeMesh = new THREE.Mesh(geometry, cubeMaterial);
cubeMesh.position.z = -8
scene.add(cubeMesh)


const controls = new OrbitControls(camera, canvas);
scene.add(camera)


// 设置渲染器
const renderer = new THREE.WebGLRenderer({ canvas })
// 将渲染器添加到页面
document.body.appendChild(renderer.domElement)

// document.body.appendChild( VRButton.createButton( renderer ) );
// renderer.xr.enabled = true;

// 设置大小
renderer.setSize(window.width, window.height)
// 设置像素比
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera);

window.addEventListener('resize', () => {
  // 更新相机
  camera.aspect = window.innerwidth / window.innerheight
  camera.updateProjectionMatrix()

  // 更新渲染器
  renderer.setSize(window.innerwidth, window.innerheight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


const btn = document.querySelector('#btn')
btn.onclick = () => {
  video.play();
  btn.style.display = "none";
}


const render = () => {
  controls.update();
  renderer.render(scene, camera)
  videoTexture.needsUpdate = true;

  requestAnimationFrame(render)
}
render();




// https://github.com/hua1995116/Fly-Three.js/blob/master/lesson03/code/index.html