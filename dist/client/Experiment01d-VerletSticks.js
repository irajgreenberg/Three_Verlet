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
// Draw a collection of verlet sticks 
// contained within a cube
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { VerletStrand } from './VerletStrand.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
// cube bounds
const bounds = new THREE.Vector3(2, .75, 1);
// Create/add tendrils
let tendrils = new Array(100);
for (var i = 0; i < tendrils.length; i++) {
    tendrils[i] = new VerletStrand(20);
    scene.add(tendrils[i]);
}
// Create/add outer box
const geometry2 = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
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
    for (var i = 0; i < tendrils.length; i++) {
        for (var j = 0; j < tendrils[i].nodes.length; j++) {
            tendrils[i].nodes[j].verlet();
            tendrils[i].nodes[j].constrainBounds(bounds);
        }
    }
    for (var i = 0; i < tendrils.length; i++) {
        for (var j = 0; j < tendrils[i].segmentCount; j++) {
            tendrils[i].segments[j].constrainLen();
        }
        tendrils[i].geometry.verticesNeedUpdate = true;
    }
    controls.update();
    render();
};
function render() {
    renderer.render(scene, camera);
}
animate();
