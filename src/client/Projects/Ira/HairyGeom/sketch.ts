// Grows interactive hair on any line
// Author: Ira Greenberg, 10/2021
// Center of Creative Computation, SMU
// Dependencies: PByte.js, Three.js, 

// Node/TS/Three template:
//https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git


import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BufferGeometry, Line, LineBasicMaterial, Scene, Vector3 } from 'three';
import { AnchorPoint } from '../../../PByte3/IJGUtils';
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
// cube bounds
const bounds: THREE.Vector3 = new THREE.Vector3(2.2, 2.2, 2.2);

// Create/add outer box
const geometry2: THREE.BoxGeometry = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
material2.transparent = true;
material2.opacity = .08;
const cube2: THREE.Mesh = new THREE.Mesh(geometry2, material2);
scene.add(cube2);

// Test moving line, for HairyLine tracking
const pts = [new Vector3(-.82, 0, 0), new Vector3(.82, 0, 0)];
let geom: BufferGeometry = new BufferGeometry().setFromPoints(pts);
let mat = new LineBasicMaterial({ color: 0xEE8811 });
const line = new Line(geom, mat);
//scene.add(line); // add to Group
let theta = 0.0;
let hairyBlobTheta = 0;

let hairyLine = new HairyLine(new Vector3(-.82, 0, 0), new Vector3(.82, 0, 0), 200, 4, .85, .05);
//scene.add(hairyLine);



let hairyBlob = new HairyBlob(.3, 2, .3);
scene.add(hairyBlob);
hairyBlob.moveCenter(new Vector3(.3, .2, .2));

let hairyLines: HairyLine[] = [];
for (let i = 0; i < 30; i++) {
    hairyLines[i] = new HairyLine(hairyBlob.sticks[i].start.position, hairyBlob.sticks[i].end.position, 30, 3, .85, .06);
    //  scene.add(hairyLines[i]);
}


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
camera.position.z = 3;

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
    camera.lookAt(scene.position); //0,0,0

    // Test waving Line
    (line.geometry as BufferGeometry).attributes.position.needsUpdate = true;
    line.geometry.attributes.position.setXYZ(1, pts[1].x, pts[1].y + Math.sin(theta += Math.PI / 80) * 1.1, pts[1].z);
    line.geometry.attributes.position.setXYZ(0, pts[0].x, pts[0].y + Math.cos(theta += Math.PI / 80) * 1.1, pts[0].z);


    // start verlet
    hairyLine.live();
    for (let i = 0; i < hairyLines.length; i++) {
        hairyLines[i].live();
    }

    hairyBlob.live();
    hairyBlob.constrainBounds(bounds);
    let v = new Vector3(
        Math.cos(hairyBlobTheta) * .002,
        Math.sin(hairyBlobTheta) * .002,
        Math.cos(hairyBlobTheta) * .002
    )
    hairyBlob.moveCenter(v);
    hairyBlobTheta += Math.PI / (Math.random() * 360);
    // for (let i = 0; i < hairyBlob.nodes.length; i++) {
    //     hairyBlob.move(i, new Vector3(-.01 + Math.random() * .01, -.01 + Math.random() * .01, -.01 + Math.random() * .01));
    // }

    // test update function
    let x = line.geometry.attributes.position.getX(0);
    let y = line.geometry.attributes.position.getY(0);
    let z = line.geometry.attributes.position.getZ(0);

    let x2 = line.geometry.attributes.position.getX(1);
    let y2 = line.geometry.attributes.position.getY(1);
    let z2 = line.geometry.attributes.position.getZ(1);
    hairyLine.update(new Vector3(x, y, z), new Vector3(x2, y2, z2));


    for (let i = 0; i < hairyLines.length; i++) {
        hairyLines[i].update(hairyBlob.sticks[i].start.position, hairyBlob.sticks[i].end.position);
    }

    //console.log(hairyBlob.sticks[0].start.position);

    controls.update()
    render();
}

// increase hair alpha, node alpha and node radius each click
function onMouse(event: MouseEvent) {
    // grows (currently just faces in) based on mouse presses
    hairyLine.grow();
    for (let i = 0; i < hairyLines.length; i++) {
        hairyLines[i].grow();
    }
}

// Hair follows mouse postion on screen
// eventually perhaps use joint positions
function onMouseMove(event: MouseEvent) {
    hairyLine.move(AnchorPoint.TAIL, new Vector3((event.x - window.innerWidth / 2) * .000004, -(event.y - window.innerHeight / 2) * .000009, 0))

    for (let i = 0; i < 30; i++) {
        hairyLines[i].move(AnchorPoint.TAIL, new Vector3((event.x - window.innerWidth / 2) * .000004, -(event.y - window.innerHeight / 2) * .000009, 0))
    }
}

function render() {
    renderer.render(scene, camera);
}
animate();






