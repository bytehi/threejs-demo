import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import THREEx from "./keyboardState.js";

const canvas = document.querySelector(".webgl");


// 场景
const scene = new THREE.Scene()
// 辅助线
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// 设置地板
const geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
// 地板贴图
const floorImg = require('./assets/img/floor.jpeg')
const floorTexture = new THREE.TextureLoader().load(floorImg);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 10, 10 );

// 地板材质
const floorMaterial = new THREE.MeshBasicMaterial({ 
    map: floorTexture, 
    side: THREE.DoubleSide 
});

const floor = new THREE.Mesh(geometry, floorMaterial);
// 设置地板位置
floor.position.y = -1.5;
floor.rotation.x = - Math.PI / 2;

scene.add(floor);
// 小滑块
const boxgeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterials = [];
for (let i = 0; i < 6; i++) {
    const boxMaterial = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
    });
    boxMaterials.push(boxMaterial);
}
// 小块
const box = new THREE.Mesh(boxgeometry, boxMaterials);
box.position.y = 1;
box.position.z = 8;

window.box = box;
scene.add(box);


// 相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 0;
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true; // 设置阻尼，需要在 update 调用

scene.add(camera)


const renderer = new THREE.WebGLRenderer({
    canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera);


// 控制代码
const keyboard = new THREEx.KeyboardState();
const clock = new THREE.Clock();

let clock2;

let space = 0;
let startJump = false;

const tick = () => {

    const delta = clock.getDelta();
    
    const moveDistance = 5 * delta;
    const rotateAngle = Math.PI / 2 * delta;

    if(startJump) {
        const elapsedTime = clock2.getElapsedTime()
        const moveY = Math.PI * (elapsedTime);
        if(elapsedTime >= 1) {
            startJump = false;
        }
        box.position.y = 10 * Math.sin(moveY);
    }

    if (keyboard.pressed("space") && !startJump) {
        startJump = true;
        clock2 = new THREE.Clock();
    }
    
    if (keyboard.pressed("down"))
        box.translateZ(moveDistance);
    if (keyboard.pressed("up"))
        box.translateZ(-moveDistance);
    if (keyboard.pressed("left"))
        box.translateX(-moveDistance);
    if (keyboard.pressed("right"))
        box.translateX(moveDistance);

    if (keyboard.pressed("w"))
        box.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
    if (keyboard.pressed("s"))
        box.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
    if (keyboard.pressed("a"))
        box.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
    if (keyboard.pressed("d"))
        box.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);

    const relativeCameraOffset = new THREE.Vector3(0, 5, 10);

    const cameraOffset = relativeCameraOffset.applyMatrix4( box.matrixWorld );

    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;

    if(!startJump) {
      controls.target = box.position;
    }

    controls.update();

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick();

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    renderer.setSize(sizes.width, sizes.height)
})