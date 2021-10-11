// Grows interactive hair on any line
// Author: Ira Greenberg, 10/2021
// Center of Creative Computation, SMU
// Dependencies: PByte.js, Three.js, 

// Node/TS/Three template:
//https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git


import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BufferGeometry, Line, LineBasicMaterial, Scene, Vector3 } from 'three';
import { AnchorPoint } from '../../PByte3/IJGUtils';
import { HairyLine } from './HairyLine';
import { HairyBlob } from './HairyBlob';

const scene: Scene = new Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

// Custom Geometry

// Test moving line, for HairyLine tracking
const pts = [new Vector3(-.82, 0, 0), new Vector3(.82, 0, 0)];
let geom: BufferGeometry = new BufferGeometry().setFromPoints(pts);
let mat = new LineBasicMaterial({ color: 0xEE8811 });
const line = new Line(geom, mat);
//scene.add(line); // add to Group
let theta = 0.0;

let hairyLine = new HairyLine(new Vector3(-.82, 0, 0), new Vector3(.82, 0, 0), 200, 4, .85, .05);
scene.add(hairyLine);

let blob = new HairyBlob(1, 0, .3);

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

    // Test waving Line
    (line.geometry as BufferGeometry).attributes.position.needsUpdate = true;
    line.geometry.attributes.position.setXYZ(1, pts[1].x, pts[1].y + Math.sin(theta += Math.PI / 80) * 1.1, pts[1].z);
    line.geometry.attributes.position.setXYZ(0, pts[0].x, pts[0].y + Math.cos(theta += Math.PI / 80) * 1.1, pts[0].z);


    // start verlet
    hairyLine.live();

    // test update function
    let x = line.geometry.attributes.position.getX(0);
    let y = line.geometry.attributes.position.getY(0);
    let z = line.geometry.attributes.position.getZ(0);

    let x2 = line.geometry.attributes.position.getX(1);
    let y2 = line.geometry.attributes.position.getY(1);
    let z2 = line.geometry.attributes.position.getZ(1);
    hairyLine.update(new Vector3(x, y, z), new Vector3(x2, y2, z2));

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






