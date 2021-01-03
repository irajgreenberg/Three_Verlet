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
import { Color, Vector2, Vector3 } from '/build/three.module.js';
import { AnchorPoint, GeometryDetail, Propulsion, VerletMaterials } from './PByte3/IJGUtils.js';
import { EpidermalHood } from './PByte3/EpidermalHood.js';
import { VerletSphere } from './PByte3/VerletSphere.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);
//test
let ova;
let ovaPulseIndices = [];
let amps = [];
let freqs = [];
let thetas = [];
let egg;
let eggGeometry;
let eggWireframe;
let eggCilia = [];
let eggVerts;
let tet;
let tetCounter = 0;
let eggToTetLines = [];
let stageCounter = 0;
let tendrils = new Array(0);
let tendrilCounter = 0;
let cilia = new Array(0);
let ciliaCounter = 0;
let epidermalCover;
let isHoodReady = false;
nodeType: GeometryDetail;
// cube bounds
const bounds = new THREE.Vector3(5, 5, 5);
const tetBounds = new THREE.Vector3(.75, 2, .75);
createCubeConstraints(bounds, false);
createCubeConstraints(tetBounds, false);
setLighting();
camera.position.y = .05;
camera.position.z = 3;
window.addEventListener('resize', onWindowResize, false);
//convenience function to collect nodes for cilia attachment
function getAllTendrilNodes() {
    let allNodes = [];
    for (var i = 0; i < tendrils.length; i++) {
        for (var j = 0; j < tendrils[i].nodes.length; j++) {
            allNodes.push(tendrils[i].nodes[j]);
        }
    }
    return allNodes;
}
// Birth stage - egg
function hatch() {
    //test
    let vals = [0];
    //ova = new VerletSphere(new Vector3(), new Vector2(.075, .1), 18, 18);
    ova = new VerletSphere(new Vector3(), new Vector2(.075 * 2.4, .1 * 2.3), 18, 18);
    ova.setStickColor(new Color(0X7777DD), .25);
    ova.addTendrils(12, .2);
    scene.add(ova);
    for (var i = 0, j = 0; i < ova.nodes.length; i++, j++) {
        if (i % 2 == 0) {
            ovaPulseIndices.push(i);
            amps.push(THREE.MathUtils.randFloat(.007, .01));
            freqs.push(THREE.MathUtils.randFloat(Math.PI / 120, Math.PI / 15));
            thetas.push(0);
        }
    }
    //ova.push(vals, new Vector3(.02, .003, .004));
    eggGeometry = new THREE.TorusKnotGeometry(.07, .04, 24, 8, 1, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0XBB3300, wireframe: true });
    material.opacity = 0.25;
    material.transparent = true;
    egg = new THREE.Mesh(eggGeometry, material);
    scene.add(egg);
    eggVerts = eggGeometry.vertices;
}
hatch();
// Egg Cilia
// function addEggCilia(ciliaSegments: number = 0.0, cilialLength: number = 0.0, ciliaTension: number) {
//     // let ciliaNodes: VerletNode[] = getAllTendrilNodes();
//     for (var i = 0; i < eggVerts.length; i++) {
//         let vec = eggVerts[i].clone();
//         vec.normalize();
//         vec.multiplyScalar(cilialLength * .125);
//         eggCilia.push(new VerletStrand(eggVerts[i],
//             new THREE.Vector3(eggVerts[i].x - vec.x,
//                 eggVerts[i].y - vec.y,
//                 eggVerts[i].z - vec.z),
//             ciliaSegments,
//             AnchorPoint.HEAD,
//             ciliaTension, GeometryDetail.TRI));
//         scene.add(eggCilia[i]);
//     }
// }
// addEggCilia(5, .2, .49);
// stage 1 - Tetrahedral core
function addTet() {
    //pos: Vector3, radius: number, tension: number, isGrowable: boolean
    //tet = new VerletTetrahedron(new Vector3(0, -.75, 0), .3, .03, true);
    tet = new VerletTetrahedron(new Vector3(0, 0, 0), .5, .03, true);
    tet.setNodesScale(2.4);
    tet.setNodesColor(new THREE.Color(0X996611));
    tet.setSticksColor(new THREE.Color(0XFF0000));
    tet.setSticksOpacity(.4);
    scene.add(tet);
    tet.moveNode(0, new Vector3(.02, -.003, 0));
}
addTet();
// Tendrils
function addTendril(pos) {
    // const n = new VerletNode(new THREE.Vector3(pos.x, pos.y, pos.z), THREE.MathUtils.randFloat(.01, .1),
    //     new THREE.Color(.7, .5, .7), GeometryDetail.DODECA);
    const n = new VerletNode(new THREE.Vector3(pos.x, pos.y, pos.z), 10, new THREE.Color(.7, .5, .7), GeometryDetail.DODECA);
    let segCount = THREE.MathUtils.randInt(5, 20);
    segCount = 15;
    let tempVec = new Vector3(tet.nodes[0].position.x * .01, tet.nodes[0].position.y * .01, tet.nodes[0].position.z * .01);
    // let ns = new VerletStrand(tet.nodes[0].position, n.position, segCount, AnchorPoint.HEAD,
    //     THREE.MathUtils.randFloat(.001, .4), GeometryDetail.OCTA);
    let ns = new VerletStrand(tet.nodes[0].position, tempVec, segCount, AnchorPoint.HEAD, THREE.MathUtils.randFloat(.7, .9), GeometryDetail.SPHERE_LOW);
    ns.setNodesScale(THREE.MathUtils.randInt(10, 18));
    ns.setNodesColor(new THREE.Color(1, .3, .3));
    ns.setStrandMaterials(new THREE.Color(.3, .5, 1), .3);
    tendrils.push(ns);
    ns.setNodeVisible(0, false);
    scene.add(ns);
    ns.moveNode(ns.nodes.length - 1, new THREE.Vector3(THREE.MathUtils.randFloatSpread(.08), THREE.MathUtils.randFloatSpread(.08), THREE.MathUtils.randFloatSpread(.08)));
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
// Hood
function addHood() {
    //console.group("in addhood func");
    epidermalCover = new EpidermalHood(new THREE.Vector3(0, .50, 0), .59, .65, 40, 10, .675, [GeometryDetail.ICOSA, GeometryDetail.TETRA, GeometryDetail.TRI]);
    epidermalCover.addHangingTendrils(9, .9, .13);
    epidermalCover.addCilia(2, .05, .85);
    epidermalCover.setDynamics(new Propulsion(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -.04, 0), new THREE.Vector3(0, Math.PI / 1500, 0)));
    epidermalCover.setMaterials(new VerletMaterials(new THREE.Color(.8, .6, 8), /*node color*/ new THREE.Color(.4, .6, .75), /*spine color*/ .45, /*spine alpha*/ new THREE.Color(0, .2, .4), /*slice color*/ .65, /*slice alpha*/ new THREE.Color(1, .5, .6), /*tendril node color*/ new THREE.Color(1, .4, .9), /*tendril color*/ .2, /*tendril alpha*/ new THREE.Color(.9, 1, 1), /*cilia node color*/ new THREE.Color(1, .6, .1), /*cilia color*/ .4)); /*cilia alpha*/
    epidermalCover.setNodesScale(6.2, 18, 3);
    epidermalCover.setNodesVisible(true, true, true);
    scene.add(epidermalCover);
    isHoodReady = false;
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
function render() {
    renderer.render(scene, camera);
}
var animate = function () {
    requestAnimationFrame(animate);
    controls.autoRotate = true;
    camera.lookAt(scene.position); //0,0,0
    ova.verlet();
    ova.constrain(bounds);
    ova.pulseIndices(ovaPulseIndices, amps, freqs, thetas);
    if (egg !== undefined) {
        egg.rotateX(Math.PI / 180);
        egg.rotateY(Math.PI / 45);
        egg.rotateZ(Math.PI / 30);
    }
    // egg cilia
    // eggGeometry.verticesNeedUpdate = true;
    // let geom = eggGeometry as THREE.Geometry;
    // // geom.dynamic = true;
    // eggVerts = eggGeometry.vertices;
    // for (var i = 0; i < eggCilia.length; i++) {
    //     eggCilia[i].nodes[0].position.x = eggVerts[i].x;
    //     eggCilia[i].nodes[0].position.y = eggVerts[i].y;
    //     eggCilia[i].nodes[0].position.z = eggVerts[i].z;
    //     eggCilia[i].geometry.verticesNeedUpdate = true;
    //     eggCilia[i].geometry.dynamic = true;
    // }
    if (tet !== undefined) {
        tet.verlet();
        tet.pulseNode(0, .003, Math.PI / 45);
        tet.constrain(tetBounds, new Vector3(0, -1.3, 0));
        for (var t of tendrils) {
            t.constrainBounds(tetBounds, new Vector3(0, -1.3, 0));
        }
        // move egg to center of dynamic tetrahedron
        const avgPos = new Vector3();
        for (var i = 0; i < tet.nodes.length; i++) {
            avgPos.add(tet.nodes[i].position);
            // lines between egg and tet nodes
            const points = [];
            points.push(egg.position);
            points.push(tet.nodes[i].position);
            //let eggToTetLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            if (eggToTetLines[i] !== undefined) {
                eggToTetLines[i].geometry.setFromPoints(points);
            }
        }
        avgPos.divideScalar(tet.nodes.length);
        if (egg !== undefined) { // super unnecesary
            egg.position.set(avgPos.x, avgPos.y, avgPos.z);
            ova.position.set(avgPos.x, avgPos.y, avgPos.z);
            //eggWireframe.position.set(avgPos.x, avgPos.y, avgPos.z);
        }
    }
    if (epidermalCover !== undefined) {
        epidermalCover.pulse();
        epidermalCover.constrainBounds(bounds);
    }
    controls.update();
    updateNodes();
    render();
};
animate();
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
// many bad magic nums down here. shameful.
function onMouse(event) {
    // after hatching
    // stage 1 - Tetrahedron core
    if (tetCounter < 11) {
        tet.setNode();
        if (tetCounter < 5) {
            let eggToTetLineMaterial = new THREE.LineBasicMaterial({ color: 0x669966 });
            eggToTetLineMaterial.transparent = true;
            eggToTetLineMaterial.opacity = .25;
            const points = [];
            points.push(egg.position);
            points.push(tet.nodes[tetCounter].position);
            let eggToTetLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            eggToTetLines.push(new THREE.Line(eggToTetLineGeometry, eggToTetLineMaterial));
            scene.add(eggToTetLines[tetCounter]);
        }
        tetCounter++;
    }
    // stage 2 - tendrils
    if (tetCounter == 11 && tendrilCounter < 5) {
        const pos = getScreenPos(new THREE.Vector2(event.clientX, event.clientY));
        //addTendril(pos);
        addTendril(new Vector3(tet.position.x + tet.nodes[tendrilCounter].position.x, tet.position.y + tet.nodes[tendrilCounter].position.y, tet.position.z + tet.nodes[tendrilCounter].position.z));
        tendrilCounter++;
    }
    // stage 3 - cilia
    if (ciliaCounter++ == 15) {
        addCilia(5, .2, .49);
        isHoodReady = true;
    }
    if (isHoodReady && ciliaCounter > 16) {
        addHood();
    }
}
