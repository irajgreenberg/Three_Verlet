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

// Draw a Pulsing Epidural Hood
// contained within a cube

// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------

import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { VerletNode } from './VerletNode.js';
import { visitNodes } from 'typescript';
import { VerletStick } from './VerletStick.js';
import { VerletStrand } from './VerletStrand.js';
import { EpidermalHood } from './EpidermalHood.js';
import { Propulsion, VerletMaterials } from './IJGUtils.js';

const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

// cube bounds
const bounds: THREE.Vector3 = new THREE.Vector3(2, 1.75, 1);

// Create Epidermal Hood
// cover
let epidermalCover = new EpidermalHood(new THREE.Vector3(0, 0, 0), .27, .5, 56, 24, .575);
epidermalCover.setDynamics(new Propulsion(new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -.03, 0),
    new THREE.Vector3(0, Math.PI / 2000, 0)));

epidermalCover.setMaterials(new VerletMaterials(
    .01,
    new THREE.Color(.6, .6, 1),
    .2,
    new THREE.Color(.7, 0, .6),
    .5,
    new THREE.Color(.5, 0, .8),
    .5));

epidermalCover.setNodesScale(5.2);
epidermalCover.addHangingTendrils(59, .1, .03);

scene.add(epidermalCover);


let epidermalHood = new EpidermalHood(epidermalCover.getApex().multiply(new THREE.Vector3(-1)), .2, .2, 30, 30, .2);
epidermalHood.setMaterials(new VerletMaterials(
    .01,
    new THREE.Color(.9, .7, .7),
    .4,
    new THREE.Color(1, .5, 0),
    .4,
    new THREE.Color(.8, .8, .9),
    .4));
epidermalHood.setNodesScale(4);
epidermalHood.addHangingTendrils();
scene.add(epidermalHood);

let epidermalHood2 = new EpidermalHood(new THREE.Vector3(0, 0, 0), .1, .1, 15, 12, .8);
epidermalHood2.setMaterials(new VerletMaterials(
    .01,
    new THREE.Color(.9, .3, .9),
    .4,
    new THREE.Color(.6, 0, 0),
    .4,
    new THREE.Color(.8, 0, 0),
    .4));
epidermalHood2.setNodesScale(3);
epidermalHood2.addHangingTendrils(30, .7, .99);

scene.add(epidermalHood2);



// Create/add outer box
const geometry2: THREE.BoxGeometry = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
material2.transparent = true;
material2.opacity = .08;
const cube2: THREE.Mesh = new THREE.Mesh(geometry2, material2);
scene.add(cube2);

camera.position.z = .85;

// animation vars
// let spd: THREE.Vector3 = new THREE.Vector3(.01, .1, .1);
// let theta = 0.0;
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

    epidermalCover.pulse();
    epidermalCover.constrainBounds(bounds);

    epidermalHood.follow(epidermalCover.getApex().add(new THREE.Vector3(0, -.28, .0)));
    epidermalHood.constrainBounds(bounds);

    epidermalHood2.follow(epidermalHood.getApex().add(new THREE.Vector3(0, -.125, 0)));
    epidermalHood2.constrainBounds(bounds);




    controls.update()
    render();
};

function render() {
    renderer.render(scene, camera);
}
animate();
