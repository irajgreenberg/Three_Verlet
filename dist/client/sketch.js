// RestroyoCity
// Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
// Dependencies: PByte.js, Three.js, 
//Original template, thanks to by Sean Bradley:
//https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git
import { FurrySegment } from './FurrySegment.js';
import { Scene, Vector3 } from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import * as THREE from '/build/three.module.js';
const scene = new Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);
//custom geometry
let furSeg = new FurrySegment(new Vector3(-.75, 0, 0), new Vector3(.75, 0, 0), 20, .75);
scene.add(furSeg);
// Simple lighting calculations
const color = 0xEEEEFF;
const intensity = .85;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
const color2 = 0xFFFFDD;
const intensity2 = 1;
const light2 = new THREE.DirectionalLight(color, intensity);
light2.position.set(-2, 6, 1);
//light2.target.position.set(0, 0, 0);
scene.add(light2);
//scene.add(light2.target);
camera.position.y = .8;
camera.position.z = 2;
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
var animate = function () {
    requestAnimationFrame(animate);
    controls.autoRotate = true;
    camera.lookAt(scene.position); //0,0,0
    // custom gemoetry
    controls.update();
    render();
};
function onMouse(event) {
}
function render() {
    renderer.render(scene, camera);
}
animate();
