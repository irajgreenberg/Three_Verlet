// Grows interactive hair on any line
// Author: Ira Greenberg, 10/2021
// Center of Creative Computation, SMU
// Dependencies: PByte.js, Three.js, 

// Node/TS/Three template:
//https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git


import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Scene, Vector3 } from 'three';
import { AnchorPoint } from '../../PByte3/IJGUtils';
import { HairyLine } from './HairyLine';

const scene: Scene = new Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

// Custom Geometry
let hairyLine = new HairyLine(new Vector3(-.82, 0, 0), new Vector3(.82, 0, 0), 400, 10);
scene.add(hairyLine);

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
window.addEventListener('mousemove', onMouseMove, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

var animate = function () {
    requestAnimationFrame(animate);
    //controls.autoRotate = true;
    camera.lookAt(scene.position); //0,0,0

    // start verlet
    hairyLine.live();

    controls.update()
    render();
}

// increase hair alpha, node alpha and node radius each click
function onMouse(event: MouseEvent) {
    // grows (currently just faces in) based on mouse presses
    hairyLine.grow();
}

// Hair follows mouse postion on screen
// eventually perhaps use joint positions
function onMouseMove(event: MouseEvent) {
    hairyLine.move(AnchorPoint.TAIL, new Vector3((event.x - window.innerWidth / 2) * .000004, -(event.y - window.innerHeight / 2) * .000009, 0))
}

function render() {
    renderer.render(scene, camera);
}
animate();






