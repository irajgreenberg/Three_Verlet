// Title:  OCD Tapping PByte test
// Author: Ira Greenberg, 10/2021
// Center of Creative Computation, SMU
// Dependencies: PByte.js, Three.js, 

// Reference:
// Node/TS/Three template: https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git
// Lighting and shadows: https://redstapler.co/threejs-realistic-light-shadow-tutorial/



import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { AmbientLight, BufferGeometry, DirectionalLight, DoubleSide, HemisphereLight, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, Scene, SpotLight, TextureLoader, Vector3, WebGLRenderer } from 'three';



const scene: Scene = new Scene();
scene.background = new THREE.Color(0xdddddd);
const camera: PerspectiveCamera = new PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 4000);
camera.position.set(0, 80, 100);
const renderer: WebGLRenderer = new WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
// renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.toneMappingExposure = 1.65;

document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

// Custom Geometry
// cube bounds
const bounds: THREE.Vector3 = new THREE.Vector3(600, 600, 100);
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

/****************************
****** CUSTOM GEOMETRY ******
****************************/
// plane
const geometry = new PlaneGeometry(400, 400);
const material = new MeshPhongMaterial({ color: 0x222222, opacity: 0.5, side: DoubleSide });
//material.opacity = 0.5;

const plane = new Mesh(geometry, material);
plane.rotateX(-Math.PI / 2);
// plane.castShadow = true;
plane.receiveShadow = true;
//console.log(../);
const texture = new TextureLoader().load("https://media.istockphoto.com/photos/rusty-painted-metal-background-picture-id1318168616");
//const texture = new TextureLoader().load("~/Desktop/metal_02.jpg");
//"C:\Users\Ira\Desktop\metal_02.jpg"
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1);
plane.material.map = texture;

scene.add(plane);

// sphere
const sphereGeom = new THREE.SphereGeometry(50, 32, 16);
const sphereMat = new THREE.MeshPhongMaterial({ color: 0xDD8800 });
const sphere = new THREE.Mesh(sphereGeom, sphereMat);
sphere.geometry.scale(.35, .35, .35);
sphere.translateY(75);
sphere.castShadow = true;
sphere.receiveShadow = true;
// sphere.material.map.anisotropy = 16;
scene.add(sphere);


// Create/add outer box
const geometry2: THREE.BoxGeometry = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
material2.transparent = true;
material2.opacity = .08;
const cube2: THREE.Mesh = new THREE.Mesh(geometry2, material2);
scene.add(cube2);

// Simple lighting calculations
const color = 0xEE88FF;
const intensity = .55;
const light = new AmbientLight(color, intensity);

scene.add(light);

const color2 = 0xFFFFDD;
const intensity2 = 1;
const light2 = new DirectionalLight(color, intensity);
light2.castShadow = true;
light2.position.set(-2, 6, 1);

//scene.add(light2);


const hemiLight = new HemisphereLight(0xffeeb1, 0x080820, 4);
//scene.add(hemiLight);

const spot = new SpotLight(0xffa95c, 2);
spot.position.set(-30, 300, 50);
spot.castShadow = true;
spot.shadow.radius = 8; //doesn't workw ith PCFsoftshadows

spot.shadow.bias = -0.0001;
spot.shadow.mapSize.width = 1024 * 4;
spot.shadow.mapSize.height = 1024 * 4;
scene.add(spot);


window.addEventListener('resize', onWindowResize, false);
window.addEventListener('mousemove', onMouseMove, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

var animate = function () {
    requestAnimationFrame(animate);
    controls.autoRotate = true;
    camera.lookAt(scene.position);

    // spot.position.set(
    //     camera.position.x,
    //     camera.position.y + Math.cos(renderer.info.render.frame * Math.PI / 180) * 20,
    //     camera.position.z + Math.sin(renderer.info.render.frame * Math.PI / 180) * 20
    // );

    controls.update()
    render();
}


function onMouse(event: MouseEvent) {

}


function onMouseMove(event: MouseEvent) {

}

function render() {
    renderer.render(scene, camera);
    // requestAnimationFrame(animate);
}
animate();






