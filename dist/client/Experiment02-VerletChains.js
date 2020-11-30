//Boilerplate Typescript/Three/VSCode, by Sean Bradley:
//git clone https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git
// For new projects:  1. npm install -g typescript, 
//                    2. npm install
// To run:            3. npm run dev 
//                    Server runs locally at port 3000
// These experiments support development
// of an 'independent' softbody organism.
// This work is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Draw a collection of verlet chains 
// contained within a cube
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { VerletChain } from './VerletChain.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
// const stickCount = 2;
// let vSticks:VerletStick[] = new Array(stickCount);
// for(var i=0; i<stickCount; i++){
//     let tn1:VerletNode = new VerletNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.1), 
//     THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1)), THREE.MathUtils.randFloat(.002, .005));
//     let tn2:VerletNode = new VerletNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.1), 
//     THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1)), THREE.MathUtils.randFloat(.002, .005));
//     vSticks[i] =  new VerletStick(tn1, tn2, THREE.MathUtils.randFloat(.001, .01), 0);
//     scene.add(vSticks[i]);
//     vSticks[i].moveNode(1, new THREE.Vector3(THREE.MathUtils.randFloatSpread(.01), 
//     THREE.MathUtils.randFloatSpread(.01), THREE.MathUtils.randFloatSpread(.01)));
// }
let verletChain = new VerletChain(new THREE.Vector3(0, 0, .2), new THREE.Vector3(0, 0, -.2), 4, 0);
scene.add(verletChain);
verletChain.moveSegment(0, new THREE.Vector3(THREE.MathUtils.randFloatSpread(.00001), THREE.MathUtils.randFloatSpread(.00001), THREE.MathUtils.randFloatSpread(.00001)));
// outer box
const geometry2 = new THREE.BoxGeometry(2, .75, 1);
const material2 = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube2);
camera.position.z = 2;
// animation vars
let spd = new THREE.Vector3(.01, .1, .1);
let theta = 0.0;
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
    verletChain.verlet();
    verletChain.constrainBounds(new THREE.Vector3(2, .75, 1));
    controls.update();
    render();
};
function render() {
    renderer.render(scene, camera);
}
animate();
