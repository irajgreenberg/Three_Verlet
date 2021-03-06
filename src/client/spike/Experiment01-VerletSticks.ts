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
import { VerletNode } from './VerletNode.js';
import { visitNodes } from 'typescript';
import { VerletStick } from './VerletStick.js';

const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
                        75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

// cube bounds
const bounds: THREE.Vector3 = new THREE.Vector3(2, .75, 1);

const stickCount = 40;
let nodes:VerletNode[] = new Array(stickCount*2);
let vSticks:VerletStick[] = new Array(stickCount);

// to draw sticks

let drawnSticks:THREE.Line[] = new Array(stickCount);

for(var i=0, j=0; i<stickCount; i++, j+=2){
    nodes[j] = new VerletNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.09), 
    THREE.MathUtils.randFloatSpread(.09), THREE.MathUtils.randFloatSpread(.09)), THREE.MathUtils.randFloat(.002, .005));
    scene.add(nodes[j]);
    nodes[j].moveNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1)));
    
    nodes[j+1] = new VerletNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.09), 
    THREE.MathUtils.randFloatSpread(.09), THREE.MathUtils.randFloatSpread(.09)), THREE.MathUtils.randFloat(.002, .005));
    scene.add(nodes[j+1]);
    nodes[j+1].moveNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1)));
    
    // add constraints
    vSticks[i] =  new VerletStick(nodes[j], nodes[j+1], THREE.MathUtils.randFloat(.001, .01), 0);
    
    var geometry = new THREE.Geometry();
    let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    geometry.vertices.push(vSticks[i].start.position);
    geometry.vertices.push(vSticks[i].end.position);
    drawnSticks[i] = new THREE.Line(geometry, material);
    scene.add(drawnSticks[i]);

        // move nodes
    // if (i % 2 == 0) {
    //     nodes[i].moveNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1), THREE.MathUtils.randFloatSpread(.1)));
    // }
}

// outer box
const geometry2: THREE.BoxGeometry = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
const cube2: THREE.Mesh = new THREE.Mesh(geometry2, material2);
scene.add(cube2);

camera.position.z = 2;


// animation vars
let spd:THREE.Vector3 = new THREE.Vector3(.01, .1, .1);
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

    for(var i=0; i<nodes.length; i++){
        nodes[i].verlet();
        nodes[i].constrainBounds(bounds);
    }
        
        
    for (var i=0, j=0; i<stickCount; i++, j+=2) {
        vSticks[i].constrainLen();
        drawnSticks[i].geometry.verticesNeedUpdate = true;

    }

    controls.update()
    render();
};

function render() {
    renderer.render(scene, camera);
}
animate();
