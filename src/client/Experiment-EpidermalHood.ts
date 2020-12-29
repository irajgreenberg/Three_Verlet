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
import { VerletNode } from './PByte3/VerletNode.js';
import { visitNodes } from 'typescript';
import { VerletStick } from './PByte3/VerletStick.js';
import { VerletStrand } from './PByte3/VerletStrand.js';
import { EpidermalHood } from './EpidermalHood.js';
import { GeometryDetail, Propulsion, VerletMaterials } from './PByte3/IJGUtils.js';
import { Geometry } from '/build/three.module.js';

const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

// cube bounds
const bounds: THREE.Vector3 = new THREE.Vector3(2, 1.75, 1);

// Create Epidermal Hood
// cover
let epidermalCover = new EpidermalHood(new THREE.Vector3(0, 0, 0), .27, .5, 30, 50, .875, [GeometryDetail.ICOSA, GeometryDetail.TETRA, GeometryDetail.TRI]);
epidermalCover.addHangingTendrils(10, .4, .9);
epidermalCover.addCilia(2, .05, .85);
epidermalCover.setDynamics(new Propulsion(new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -.04, 0),
    new THREE.Vector3(0, Math.PI / 1500, 0)));
epidermalCover.setMaterials(new VerletMaterials(
    new THREE.Color(.8, .6, 8),  /*node color*/
    new THREE.Color(.8, .1, .9), /*spine color*/
    .2,                          /*spine alpha*/
    new THREE.Color(.7, 0, .6),  /*slice color*/
    .5,                          /*slice alpha*/
    new THREE.Color(.7, .4, .6),  /*tendril node color*/
    new THREE.Color(.5, .3, .9),  /*tendril color*/
    .5,                          /*tendril alpha*/
    new THREE.Color(.5, .8, 1),  /*cilia node color*/
    new THREE.Color(.5, .8, 1),  /*cilia color*/
    .2));                        /*cilia alpha*/


epidermalCover.setNodesScale(6.2, 8, 3);
epidermalCover.setNodesVisible(true, true, true);
scene.add(epidermalCover);


let epidermalHood = new EpidermalHood(epidermalCover.getApex().multiply(new THREE.Vector3(-1)), .2, .2, 40, 30, .95);
epidermalHood.addHangingTendrils(20, .45, .79);
epidermalHood.setMaterials(new VerletMaterials(
    new THREE.Color(.9, .9, .9),
    new THREE.Color(.9, .7, .7),
    .4,
    new THREE.Color(1, .5, 0),
    .4,
    new THREE.Color(.8, .8, .9),
    new THREE.Color(.8, .8, .9),
    .2,
    new THREE.Color(.8, .8, .9),
    new THREE.Color(.8, .8, .9),
    .4));
epidermalHood.setNodesScale(4, 2);

epidermalHood.setNodesVisible(true, true, false);
scene.add(epidermalHood);

let epidermalHood2 = new EpidermalHood(new THREE.Vector3(0, 0, 0), .1, .1, 15, 12, .8);
epidermalHood2.addHangingTendrils(30, .55, .99);
epidermalHood2.setMaterials(new VerletMaterials(
    new THREE.Color(.3, 0, .1),
    new THREE.Color(.5, 0, .2),
    .8,
    new THREE.Color(.6, .2, 0),
    .8,
    new THREE.Color(.5, .2, .2),
    new THREE.Color(.6, .5, .5),
    .5,
    new THREE.Color(.8, .8, .9),
    new THREE.Color(.8, .8, .9),
    .4));
epidermalHood2.setNodesScale(10, 7);
epidermalHood2.setNodesVisible(true, true, false);
scene.add(epidermalHood2);



// Create/add outer box
const geometry2: THREE.BoxGeometry = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
material2.transparent = true;
material2.opacity = .08;
const cube2: THREE.Mesh = new THREE.Mesh(geometry2, material2);
scene.add(cube2);

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
camera.position.z = .20;


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

    // camera.position.y = .05;
    camera.position.x = Math.cos(renderer.info.render.frame * Math.PI / 360) * .15;
    camera.position.y = Math.cos(renderer.info.render.frame * Math.PI / 720) * .15;
    camera.position.z = Math.sin(renderer.info.render.frame * Math.PI / 720) * .35;


    controls.update()
    render();
};

function render() {
    renderer.render(scene, camera);
}
animate();
