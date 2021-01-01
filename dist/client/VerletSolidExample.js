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
// Draw a Verlet controlled solid
// contained within a cube
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { VerletTetrahedron } from './PByte3/VerletTetrahedron.js';
import { Vector3 } from '/build/three.module.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);
//incrementally controlls development of the organism
let globalCounter = 0;
//pos: Vector3, radius: number, tension: number, isGrowable: boolean
let tet = new VerletTetrahedron(new Vector3(0), .1, .03, true);
tet.setNodesScale(1.5);
tet.setNodesColor(new THREE.Color(0X994411));
scene.add(tet);
tet.moveNode(0, new Vector3(.02, .003, 0));
// cube bounds
const bounds = new THREE.Vector3(2, 1.75, 1);
// Create/add outer box
const geometry2 = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2 = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
material2.transparent = true;
material2.opacity = .08;
const cube2 = new THREE.Mesh(geometry2, material2);
//scene.add(cube2);
// Simple lighting calculations
const color = 0xEEEEFF;
const intensity = .65;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
const color2 = 0xFFFFDD;
const intensity2 = 1;
const light2 = new THREE.DirectionalLight(color, intensity);
light2.position.set(-2, 6, 1);
//light2.target.position.set(0, 0, 0);
scene.add(light2);
//scene.add(light2.target);
camera.position.y = .05;
camera.position.z = 3;
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
    tet.verlet();
    tet.pulseNode(0, .003, Math.PI / 45);
    tet.constrain(bounds);
    controls.update();
    render();
};
function onMouse(event) {
    if (globalCounter < 12) {
        tet.setNode();
    }
    globalCounter++;
}
function render() {
    renderer.render(scene, camera);
}
animate();
