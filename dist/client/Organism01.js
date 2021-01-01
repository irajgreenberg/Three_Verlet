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
// Growable Organism01 
// contrained within a cube
// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------
import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { VerletNode } from './PByte3/VerletNode.js';
import { VerletStrand } from './PByte3/VerletStrand.js';
import { VerletTetrahedron } from './PByte3/VerletTetrahedron.js';
import { Vector3 } from '/build/three.module.js';
import { AnchorPoint, GeometryDetail } from './PByte3/IJGUtils.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);
let tetCounter = 0;
let stageCounter = 0;
let tendrils = new Array(0);
let tendrilCounter = 0;
let cilia = new Array(0);
let ciliaCounter = 0;
nodeType: GeometryDetail;
//pos: Vector3, radius: number, tension: number, isGrowable: boolean
let tet = new VerletTetrahedron(new Vector3(0), .1, .03, true);
tet.setNodesScale(1.7);
tet.setNodesColor(new THREE.Color(0X443300));
tet.setSticksColor(new THREE.Color(0XFF0000));
scene.add(tet);
tet.moveNode(0, new Vector3(.02, .003, 0));
// cube bounds
const bounds = new THREE.Vector3(2, 1.75, 1);
createCubeConstraints(bounds, false);
setLighting();
camera.position.y = .05;
camera.position.z = 3;
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
function updateNodes() {
    let k = 0;
    for (var i = 0; i < tendrils.length; i++) {
        tendrils[i].verlet();
        tendrils[i].setHeadPosition(tet.nodes[i].position);
        tendrils[i].constrainBounds(bounds);
        if (cilia.length > 0) {
            for (var j = 0; j < tendrils[i].nodes.length; j++) {
                k = tendrils[i].nodes.length * i + j;
                cilia[k].verlet();
                cilia[k].setHeadPosition(tendrils[i].nodes[j].position);
                cilia[k].constrainBounds(bounds);
            }
        }
    }
}
var animate = function () {
    requestAnimationFrame(animate);
    controls.autoRotate = true;
    camera.lookAt(scene.position); //0,0,0
    tet.verlet();
    tet.pulseNode(0, .003, Math.PI / 45);
    tet.constrain(bounds);
    controls.update();
    updateNodes();
    render();
};
function onMouse(event) {
    // stage 1 - Tetrahedron core
    if (tetCounter < 11) {
        tet.setNode();
        tetCounter++;
    }
    // stage 2 - tendrils
    if (tetCounter == 11 && tendrilCounter < 5) {
        const pos = getScreenPos(new THREE.Vector2(event.clientX, event.clientY));
        addTendril(pos);
        tendrilCounter++;
    }
    // stage 3 - cilia
    if (ciliaCounter++ == 15) {
        addCilia(10, .3, .39);
    }
}
// Cilia
function addCilia(ciliaSegments = 0.0, cilialLength = 0.0, ciliaTension) {
    let ciliaNodes = getAllTendrilNodes();
    for (var i = 0; i < tendrils.length; i++) {
        for (var j = 0; j < tendrils[i].nodes.length; j++) {
            let k = tendrils[i].nodes.length * i + j;
            let vec = ciliaNodes[k].position.clone();
            vec.normalize();
            vec.multiplyScalar(cilialLength * .125);
            cilia.push(new VerletStrand(ciliaNodes[k].position, new THREE.Vector3(ciliaNodes[k].position.x - vec.x, ciliaNodes[k].position.y - vec.y, ciliaNodes[k].position.z - vec.z), ciliaSegments, AnchorPoint.HEAD, ciliaTension, GeometryDetail.TRI));
            //cilia[k].setNodesScale(3);
            scene.add(cilia[k]);
        }
    }
}
//convenience function to collect nodes
function getAllTendrilNodes() {
    let allNodes = [];
    for (var i = 0; i < tendrils.length; i++) {
        for (var j = 0; j < tendrils[i].nodes.length; j++) {
            allNodes.push(tendrils[i].nodes[j]);
        }
    }
    return allNodes;
}
function render() {
    renderer.render(scene, camera);
}
animate();
function addTendril(pos) {
    const n = new VerletNode(new THREE.Vector3(pos.x, pos.y, pos.z), THREE.MathUtils.randFloat(.01, .1), new THREE.Color(.7, .5, .7), GeometryDetail.DODECA);
    let segCount = THREE.MathUtils.randInt(5, 20);
    segCount = 15;
    let tempVec = new Vector3(tet.nodes[0].position.x * .01, tet.nodes[0].position.y * .01, tet.nodes[0].position.z * .01);
    // let ns = new VerletStrand(tet.nodes[0].position, n.position, segCount, AnchorPoint.HEAD,
    //     THREE.MathUtils.randFloat(.001, .4), GeometryDetail.OCTA);
    let ns = new VerletStrand(tet.nodes[0].position, tempVec, segCount, AnchorPoint.HEAD, THREE.MathUtils.randFloat(.06, .1), GeometryDetail.OCTA);
    ns.setNodesScale(THREE.MathUtils.randInt(10, 18));
    ns.setNodesColor(new THREE.Color(1, .3, .3));
    ns.setStrandMaterials(new THREE.Color(.3, .5, .9), .3);
    tendrils.push(ns);
    ns.setNodeVisible(0, false);
    scene.add(ns);
    ns.moveNode(ns.nodes.length - 1, new THREE.Vector3(THREE.MathUtils.randFloatSpread(.08), THREE.MathUtils.randFloatSpread(.08), THREE.MathUtils.randFloatSpread(.08)));
    //}
}
// Enables placement of nodes in world space based on mousepress (screenspace placement)
function getScreenPos(clientPos2) {
    // unproject algorithm from: WestLangley
    // https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse
    vec.set((clientPos2.x / window.innerWidth) * 2 - 1, -(clientPos2.y / window.innerHeight) * 2 + 1, 0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    var distance = -camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    return pos;
}
function setLighting() {
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
}
function createCubeConstraints(bounds, isVisible = false) {
    // Create/add outer box
    const geometry2 = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
    const material2 = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
    material2.transparent = true;
    material2.opacity = .08;
    const cube2 = new THREE.Mesh(geometry2, material2);
    if (isVisible) {
        scene.add(cube2);
    }
}
