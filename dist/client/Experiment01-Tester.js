//Boilerplate Typescript/Three/VSCode, by Sean Bradley:
//git clone https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git
// For new projects:  1. npm install -g typescript, 
//                    2. npm install
// To run:            3. npm run dev 
//                    Server runs locally at port 3000
// These experiments support development
// of an 'independent' softbody organism.
// Work is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall
// Draw a collection of verlet sticks 
// contained within a cube
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { EulerStrand } from './EulerStrand.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
// cube bounds
const bounds = new THREE.Vector3(2, .75, 1);
//constructor(head: THREE.Vector3, tail: THREE.Vector3, segmentCount: number, elasticity: number = .5, damping: number = .725)
let esTendril = new EulerStrand(new THREE.Vector3(-.2, .05, 0), new THREE.Vector3(.2, .05, 0), 30, .1, .675);
scene.add(esTendril);
//esTendril.move();
// Create/add outer box
const geometry2 = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2 = new THREE.MeshBasicMaterial({ color: 0x445544, wireframe: true });
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube2);
camera.position.z = 1.55;
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
var animate = function () {
    requestAnimationFrame(animate);
    //controls.autoRotate = true;
    esTendril.move();
    esTendril.constrainBounds(bounds);
    camera.lookAt(scene.position); //0,0,0
    controls.update();
    render();
};
function render() {
    renderer.render(scene, camera);
}
animate();
