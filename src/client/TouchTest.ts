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
import { AnchorPoint, GeometryDetail, Propulsion, VerletMaterials } from './IJGUtils.js';
import { Geometry } from '/build/three.module.js';

const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

// cube bounds
const bounds: THREE.Vector3 = new THREE.Vector3(2, 1.75, 1);

// nodes
let nodes: VerletNode[] = new Array(0);
let strands: VerletStrand[] = new Array(0);
let hubNode: VerletNode;
let leaderNode: VerletNode;
let leader = new THREE.Vector3(); // moves creatures through world

//crossBraces
let braces: VerletStick[] = new Array(0);


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
camera.position.z = 3;

//create centered, invisible and anchored node
function init() {
    hubNode = new VerletNode(getScreenPos(new THREE.Vector2()), .001,
        new THREE.Color(0), GeometryDetail.TRI);
    nodes.push(hubNode);

    leaderNode = new VerletNode(getScreenPos(new THREE.Vector2()), .01, new THREE.Color(.4, .3, .6), GeometryDetail.ICOSA);
    scene.add(leaderNode);
}

// enables placement of nodes in world space based on mousepress (screen space placement)
function getScreenPos(clientPos2: THREE.Vector2): THREE.Vector3 {
    // unproject algorithm from: WestLangley
    // https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse

    vec.set(
        (clientPos2.x / window.innerWidth) * 2 - 1,
        - (clientPos2.y / window.innerHeight) * 2 + 1,
        0.5);

    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    var distance = - camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    return pos;
}

function addNode(pos: THREE.Vector3) {
    const n = new VerletNode(new THREE.Vector3(pos.x, pos.y, pos.z), THREE.MathUtils.randFloat(.01, .1),
        new THREE.Color(.7, .5, .7), GeometryDetail.DODECA);
    nodes.push(n);
    // scene.add(n);
    // don't move base node
    if (nodes.length > 1) {
        n.position.x += THREE.MathUtils.randFloatSpread(.02);
        n.position.y += THREE.MathUtils.randFloatSpread(.02);
        n.position.z += THREE.MathUtils.randFloatSpread(.02);
        let v = new THREE.Vector3(leader.x - n.position.x, leader.y - n.position.y, leader.z - n.position.z);
        // let l = leader.x - n.position.x;
        // console.log(l);

        let segCount = Math.round(v.length() * 20);
        //let SegCount = THREE.MathUtils.randInt(5, 20)
        let ns = new VerletStrand(hubNode.position, n.position, segCount, AnchorPoint.HEAD,
            THREE.MathUtils.randFloat(.001, .4), GeometryDetail.OCTA);
        ns.setNodesScale(THREE.MathUtils.randInt(10, 20));
        ns.setNodesColor(new THREE.Color(.7, .435, .2));
        strands.push(ns);
        ns.setNodeVisible(0, false);
        scene.add(ns);

        ns.moveNode(ns.nodes.length - 1,
            new THREE.Vector3(THREE.MathUtils.randFloatSpread(.08),
                THREE.MathUtils.randFloatSpread(.08),
                THREE.MathUtils.randFloatSpread(.08)))
    }

    // //add cross braces
    // if (strands.length > 3) {
    //     for (var i = 0; i < strands.length; i++) {
    //         if (i > 0) {
    //             let mat = new THREE.MeshBasicMaterial({ color: 0xAAAA00 });
    //             mat.transparent = true;
    //             mat.opacity = .3;

    //             const points = [];
    //             points.push(strands[i - 1].nodes[2].position);
    //             points.push(strands[i].nodes[2].position);
    //             let geo = new THREE.BufferGeometry().setFromPoints(points);
    //             braces.push(new VerletStick(strands[i - 1].nodes[2], strands[i].nodes[2]));
    //             let line = new THREE.Line(geo, mat);
    //             scene.add(line);
    //         }
    //     }

}

function updateNodes() {
    if (nodes.length > 1) {
        // for (var i = 0; i < nodes.length; i++) {
        //     // show nodes
        //     //nodes[i].verlet();
        // }
        for (var i = 0; i < strands.length; i++) {
            strands[i].verlet();
            //hubNode.position.x += .002;
            strands[i].setHeadPosition(leader);
            strands[i].constrainBounds(bounds);

        }
    }
}

init();


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

    leader.x = Math.cos(renderer.info.render.frame * Math.PI / 360) * .55;
    leader.y = Math.cos(renderer.info.render.frame * Math.PI / 720) * .55;
    leader.z = Math.sin(renderer.info.render.frame * Math.PI / 720) * .75;

    leaderNode.position.set(leader.x, leader.y, leader.z);
    leaderNode.constrainBounds(bounds);
    leaderNode.verlet();

    updateNodes();

    controls.update()
    render();
};


function onMouse(event: MouseEvent) {
    // convert from screenspace to worldspace
    const pos = getScreenPos(new THREE.Vector2(event.clientX, event.clientY))
    addNode(pos);
}


function render() {
    renderer.render(scene, camera);
}
animate();






