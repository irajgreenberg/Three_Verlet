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

// draw tendrils
//const tendrilCount: number = 20;
class Tendril extends THREE.Line {
    segmentCount: number;
    segments: VerletStick[];
    nodes: VerletNode[];
    geometry = new THREE.Geometry();
    material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    constructor(segmentCount: number) {
        super();
        this.segmentCount = segmentCount;
        this.segments = new Array(segmentCount);
        this.nodes = new Array(segmentCount + 1);

        let tendril: THREE.Line = new THREE.Line();
        for (var i = 0; i < this.nodes.length; i++) {
            // nodes[i] = new VerletNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.09),
            //     THREE.MathUtils.randFloatSpread(.09), THREE.MathUtils.randFloatSpread(.09)), THREE.MathUtils.randFloat(.002, .005));

            this.nodes[i] = new VerletNode(new THREE.Vector3(.2, i * .02, THREE.MathUtils.randFloatSpread(.01)), THREE.MathUtils.randFloat(.002, .005));
            scene.add(this.nodes[i]);
            if (i > 0) {
                this.nodes[i].moveNode(new THREE.Vector3(THREE.MathUtils.randFloatSpread(.001), THREE.MathUtils.randFloatSpread(.001), THREE.MathUtils.randFloatSpread(.001)));
            }
        }
        
        for (var i = 0; i < this.segments.length; i++) {
            // add constraints
            if (i == 0) {
                this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), 1);
            } else {
                this.segments[i] = new VerletStick(this.nodes[i], this.nodes[i + 1], THREE.MathUtils.randFloat(.2, .4), 0);
            }
            this.geometry.vertices.push(this.segments[i].start.position);
            if (i === this.segments.length - 1) { this.geometry.vertices.push(this.segments[i].end.position) }
            //geometry.vertices.push(vSticks[i].end.position);
        }
        tendril = new THREE.Line(this.geometry, this.material);
        scene.add(tendril);
    }
}
let tendrils: Tendril[] = new Array(100);
for (var i = 0; i < tendrils.length; i++) {
    tendrils[i] = new Tendril(20);
}





// outer box
const geometry2: THREE.BoxGeometry = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xff8800, wireframe: true });
const cube2: THREE.Mesh = new THREE.Mesh(geometry2, material2);
scene.add(cube2);

camera.position.z = 2;


// animation vars
let spd: THREE.Vector3 = new THREE.Vector3(.01, .1, .1);
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

    controls.update()
    render();
};

function render() {
    renderer.render(scene, camera);
}
animate();
