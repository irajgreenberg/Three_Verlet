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

// Draw a collection of Euler based asps 
// contained within a cube

// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { EulerStrand } from '../EulerStrand.js';


const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

// cube bounds
const bounds: THREE.Vector3 = new THREE.Vector3(2, .75, 1);

let aspCount = 75;
let aspTendrils: EulerStrand[] = new Array(aspCount)

for (var i = 0; i < aspCount; i++) {
    aspTendrils[i] = new EulerStrand(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.2), THREE.MathUtils.randFloatSpread(.2), THREE.MathUtils.randFloatSpread(.2)),
        new THREE.Vector3(THREE.MathUtils.randFloatSpread(.2), THREE.MathUtils.randFloatSpread(.2), THREE.MathUtils.randFloatSpread(.2)),
        THREE.MathUtils.randInt(25, 35), .1, .675);
    scene.add(aspTendrils[i]);
}

// Create/add outer box
const geometry2: THREE.BoxGeometry = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x445544, wireframe: true });
const cube2: THREE.Mesh = new THREE.Mesh(geometry2, material2);
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
    controls.autoRotate = true;
    for (var i = 0; i < aspCount; i++) {
        aspTendrils[i].move();
        aspTendrils[i].constrainBounds(bounds);
    }

    camera.lookAt(scene.position); //0,0,0
    controls.update()
    render();
};

function render() {
    renderer.render(scene, camera);
}
animate();
