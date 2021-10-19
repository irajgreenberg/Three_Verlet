// Organism01
// Author: Ira Greenberg, 10/2021
// Center of Creative Computation, SMU
// Dependencies: PByte.js, Three.js, 

//Original template by Sean Bradley:
//https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { BufferGeometry, Color, Vector2, Vector3 } from "three";
import { AnchorPoint, GeometryDetail } from "../../PByte3/IJGUtils";
import { VerletNode } from "../../PByte3/VerletNode";
import { VerletStick } from "../../PByte3/VerletStick";
import { VerletStrand } from '../../PByte3/VerletStrand';
import { VerletTetrahedron } from '../../PByte3/VerletTetrahedron';
import { Propulsion, VerletMaterials } from '../../PByte3/IJGUtils';
import { EpidermalHood } from '../../PByte3/EpidermalHood';
import { VerletSphere } from '../../PByte3/VerletSphere';



const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

//test
let globalCounter: number = 0;
let ova: VerletSphere;
let ovaStickColorAlpha: number = 0;
let ovaPulseIndices: number[] = [];
let isOvaBirth: boolean = false;
let isOvaCiliaBirth: boolean = false;
let ovaCiliaAlpha: number = 0
let amps: number[] = [];
let freqs: number[] = [];
let thetas: number[] = [];


let egg: THREE.Mesh;
let eggGeometry: THREE.TorusKnotGeometry;
let eggMaterial: THREE.MeshPhongMaterial;
let eggWireframe: THREE.LineSegments;
let eggCilia: VerletStrand[] = []; // do I need this?
//let eggVerts: Vector3[];
//let eggVerts = [];
let isEggBirth: boolean = false;
let tet: VerletTetrahedron;
let tetCounter: number = 0;
let eggToTetLines: THREE.Line[] = [];
let stageCounter: number = 0;
let tendrils: VerletStrand[] = new Array(0);
let tendrilCounter: number = 0;
let cilia: VerletStrand[] = new Array(0);
let ciliaCounter: number = 0;
let epidermalCover: EpidermalHood;
let isHoodReady: boolean = false;
let epidermalCoverAlpha: number = 0;
nodeType: GeometryDetail;

let finalTethers: VerletStick[] = [];
let finalTetherAlphas: number[] = [];


// cube bounds
const bounds: THREE.Vector3 = new Vector3(5, 5, 5);
const tetBounds: THREE.Vector3 = new Vector3(.85, 2, .85);
createCubeConstraints(bounds, false);
createCubeConstraints(tetBounds, false);

setLighting();
camera.position.y = .05;
camera.position.z = 1;
let cameraTheta3D = new Vector3();

window.addEventListener('resize', onWindowResize, false);

//convenience function to collect nodes for cilia attachment
function getAllTendrilNodes(): VerletNode[] {
    let allNodes: VerletNode[] = [];
    for (var i = 0; i < tendrils.length; i++) {
        for (var j = 0; j < tendrils[i].nodes.length; j++) {
            allNodes.push(tendrils[i].nodes[j]);
        }
    }
    return allNodes;
}

// Birth stage - egg
function hatch(): void {
    //test
    let vals: number[] = [0];
    //ova = new VerletSphere(new Vector3(), new Vector2(.075, .1), 18, 18);
    ova = new VerletSphere(new Vector3(), new Vector2(.075 * 2.5, .1 * 2.4), 18, 18);
    ova.setStickColor(new Color(0X7777DD), ovaStickColorAlpha);
    ova.addTendrils(12, .9);
    ova.setTendrilOpacity(ovaCiliaAlpha);
    ova.setNodeVisibility(true);
    scene.add(ova);
    for (var i = 0, j = 0; i < ova.nodes.length; i++, j++) {
        if (i % 2 == 0) {
            ovaPulseIndices.push(i);
            amps.push(THREE.MathUtils.randFloat(.007, .04))
            freqs.push(THREE.MathUtils.randFloat(Math.PI / 120, Math.PI / 15))
            thetas.push(0);
        }
    }
    //ova.push(vals, new Vector3(.02, .003, .004));

    eggGeometry = new THREE.TorusKnotGeometry(.09, .05, 24, 8, 1, 2);
    //eggGeometry.dynamic = true;
    eggMaterial = new THREE.MeshPhongMaterial({ color: 0XBB3300, wireframe: true });
    eggMaterial.opacity = 0;
    eggMaterial.transparent = true;
    egg = new THREE.Mesh(eggGeometry, eggMaterial);
    scene.add(egg);
    //eggVerts = eggGeometry.vertices;
   // eggVerts = egg.geometry.attributes.position
    // console.log("egg.geometry.attributes.position = ", egg.geometry.attributes.position)

}

hatch();

// stage 1 - Tetrahedral core
function addTet() {
    //pos: Vector3, radius: number, tension: number, isGrowable: boolean
    //tet = new VerletTetrahedron(new Vector3(0, -.75, 0), .3, .03, true);
    tet = new VerletTetrahedron(new Vector3(0, 0, 0), .6, .03, true);
    tet.tetraTendrils[0].setStrandMaterials(new THREE.Color(0xaa11dd), .35);
    tet.tetraTendrils[1].setStrandMaterials(new THREE.Color(0xFdd5522), .35);
    tet.tetraTendrils[2].setStrandMaterials(new THREE.Color(0xaa22ff), .35);
    tet.tetraTendrils[3].setStrandMaterials(new THREE.Color(0x8822ff), .35);
    tet.tetraTendrils[5].setStrandMaterials(new THREE.Color(0x99aa99), .35);
    tet.tetraTendrils[7].setStrandMaterials(new THREE.Color(0x999922), .35);
    tet.setNodesScale(3.4);
    tet.setNodesColor(new THREE.Color(0X996611));
    tet.setSticksColor(new THREE.Color(0XFF0000));
    tet.setSticksOpacity(0);
    scene.add(tet);
    tet.moveNode(0, new Vector3(.02, -.006, .04))
    tet.moveNode(1, new Vector3(-.02, .006, -.04))
}
addTet();

// Tendrils
function addTendril(pos: THREE.Vector3) {
    // const n = new VerletNode(new THREE.Vector3(pos.x, pos.y, pos.z), THREE.MathUtils.randFloat(.01, .1),
    //     new THREE.Color(.7, .5, .7), GeometryDetail.DODECA);

    const n = new VerletNode(new THREE.Vector3(pos.x, pos.y, pos.z), 10,
        new THREE.Color(.7, .5, .7), GeometryDetail.DODECA);
    let segCount = THREE.MathUtils.randInt(10, 25);
    segCount = 20;
    let tempVec = new Vector3(tet.nodes[0].position.x * .01, tet.nodes[0].position.y * .01, tet.nodes[0].position.z * .01);
    // let ns = new VerletStrand(tet.nodes[0].position, n.position, segCount, AnchorPoint.HEAD,
    //     THREE.MathUtils.randFloat(.001, .4), GeometryDetail.OCTA);

    let ns = new VerletStrand(tet.nodes[0].position, tempVec, segCount, AnchorPoint.HEAD,
        THREE.MathUtils.randFloat(.7, .9), GeometryDetail.SPHERE_LOW);
    ns.setNodesScale(THREE.MathUtils.randInt(10, 18));
    ns.setNodesColor(new THREE.Color('#5b5b3e'));
    ns.setStrandMaterials(new THREE.Color(.3, .5, 1), .3);
    tendrils.push(ns);
    ns.setNodeVisible(0, false);
    scene.add(ns);

    ns.moveNode(ns.nodes.length - 1,
        new THREE.Vector3(THREE.MathUtils.randFloatSpread(.08),
            THREE.MathUtils.randFloatSpread(.08),
            THREE.MathUtils.randFloatSpread(.08)));
}

// Cilia
function addCilia(ciliaSegments: number = 0.0, cilialLength: number = 0.0, ciliaTension: number) {
    let ciliaNodes: VerletNode[] = getAllTendrilNodes();
    for (var i = 0; i < tendrils.length; i++) {
        for (var j = 0; j < tendrils[i].nodes.length; j++) {
            let k = tendrils[i].nodes.length * i + j;
            let vec = ciliaNodes[k].position.clone();
            vec.normalize();
            vec.multiplyScalar(cilialLength * .125);
            cilia.push(new VerletStrand(ciliaNodes[k].position,
                new THREE.Vector3(ciliaNodes[k].position.x - vec.x,
                    ciliaNodes[k].position.y - vec.y,
                    ciliaNodes[k].position.z - vec.z),
                ciliaSegments,
                AnchorPoint.HEAD,
                ciliaTension, GeometryDetail.TRI));
            //cilia[k].setNodesScale(3);
            cilia[k].setStrandMaterials(new Color(0XEEEEEE), .25);

            scene.add(cilia[k]);
        }
    }
}

// Hood
function addHood() {
    //console.group("in addhood func");
    epidermalCover = new EpidermalHood(new THREE.Vector3(0, .50, 0), .59, .65, 30, 20, .675, [GeometryDetail.ICOSA, GeometryDetail.TETRA, GeometryDetail.TRI]);
    epidermalCover.addHangingTendrils(12, 1.2, .6);
    epidermalCover.addCilia(2, .05, .85);
    epidermalCover.setDynamics(new Propulsion(new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -.09, 0),
        new THREE.Vector3(0, Math.PI / 500, 0)));
    epidermalCover.setMaterials(new VerletMaterials(
        new THREE.Color(.8, .6, 8),  /*node color*/
        new THREE.Color(.4, .6, .75), /*spine color*/
        .45,                          /*spine alpha*/
        new THREE.Color(0, .2, .4),  /*slice color*/
        .65,                          /*slice alpha*/
        new THREE.Color(1, .6, .7),  /*tendril node color*/
        new THREE.Color(.3, .1, .55),  /*tendril color*/
        1,                          /*tendril alpha*/
        new THREE.Color(.9, 1, 1),  /*cilia node color*/
        new THREE.Color(1, .6, .1),  /*cilia color*/
        .4));                        /*cilia alpha*/


    epidermalCover.setNodesScale(10.2, 9, 3, true);
    epidermalCover.setNodesVisible(true, true, true);
    epidermalCover.setAllOpacity(epidermalCoverAlpha);
   // scene.add(epidermalCover);
    isHoodReady = false;

    // add yellow tethers from tet nodes to top nodes of hood
    for (var i = 0; i < tet.nodes.length; i++) {
        finalTethers.push(new VerletStick(tet.nodes[i],
            epidermalCover.spines[i].nodes[epidermalCover.spines[i].nodes.length - 1],
            .2, AnchorPoint.TAIL));
        finalTethers[i].setColor(new Color(1, .6, 0));
        finalTetherAlphas[i] = 0;
        finalTethers[i].setOpacity(finalTetherAlphas[i]);
        //finalTethers[0].lineGeometry.elementsNeedUpdate = true;
       // scene.add(finalTethers[i]);
    }
}
addHood();

// Enables placement of nodes in world space based on mousepress (screenspace placement)
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

function setLighting(): void {
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

function createCubeConstraints(bounds: Vector3, isVisible: boolean = false): void {
    // Create/add outer box
    const geometry2: THREE.BoxGeometry = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
    const material2: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
    material2.transparent = true;
    material2.opacity = .08;
    const cube2: THREE.Mesh = new THREE.Mesh(geometry2, material2);
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
   // camera.position.y = Math.sin(cameraTheta3D.y+=Math.PI/15)*10;
    camera.position.z = Math.cos(cameraTheta3D.z+=Math.PI/180)*2.2;
    camera.position.x = Math.sin(cameraTheta3D.x+=Math.PI/180)*2.2;


    if (isOvaBirth) {
        ova.setStickColor(new Color(0X7777DD), ovaStickColorAlpha);
        ova.verlet();
        ova.constrain(bounds);
        ova.pulseIndices(ovaPulseIndices, amps, freqs, thetas);
        if (ovaStickColorAlpha < .3) {
            ovaStickColorAlpha += .01;
        }
    }

    if (isEggBirth) {
        let m = egg.material as THREE.MeshPhongMaterial;
        if (m.opacity < .3) {
            m.opacity += .01;
        }
        if (egg !== undefined) {
            egg.rotateX(Math.PI / 180);
            egg.rotateY(Math.PI / 45);
            egg.rotateZ(Math.PI / 30);
        }
    }

    if (isOvaCiliaBirth) {
        if (ovaCiliaAlpha < .35) {
            ovaCiliaAlpha += .01;
        }
        ova.setTendrilOpacity(ovaCiliaAlpha)
    }


    if (tet !== undefined) {
        tet.verlet();
        tet.pulseNode(0, .009, Math.PI / 45);
        let tetAmpsRange = new Vector2(.001, .007);
        let tetFreqs = new Vector2(Math.PI / 1400, Math.PI / 25);
        //tet.pulseNodes(tetAmps, tetFreqs);
        tet.constrain(tetBounds, new Vector3(0, -1.3, 0));

        for (var t of tendrils) {
            t.constrainBounds(tetBounds, new Vector3(0, -1.3, 0));
        }

        // move egg to center of dynamic tetrahedron
        const avgPos = new Vector3();
        for (var i = 0; i < tet.nodes.length; i++) {
            avgPos.add(tet.nodes[i].position)

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

    if (isHoodReady && ciliaCounter > 16) {
        if (epidermalCoverAlpha < .34) {
            epidermalCoverAlpha += .01;
        }
        epidermalCover.setAllOpacity(epidermalCoverAlpha);
        for (var i = 0; i < tet.nodes.length; i++) {
            if (finalTetherAlphas[i] < .2) {
                finalTetherAlphas[i] += .002;
            }
            finalTethers[i].setOpacity(finalTetherAlphas[i]);
        }

    }
     
    for (var i = 0; i < tet.nodes.length; i++) {
        finalTethers[i].constrainLen();
    }

    controls.update()
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

// ADD TOUCH EVENTS
window.addEventListener('touchstart', (event) => {
    // prevent the window from scrolling
    event.preventDefault();
    setPickPosition(event.touches[0]);
}, { passive: false });
window.addEventListener('touchmove', (event) => {
    setPickPosition(event.touches[0]);

    globalCounter++;
    // 1st mouse press
    // egg wifreame fades in
    if (globalCounter === 1) {
        isOvaBirth = true;
        // knot core fade in
    } else if (globalCounter === 2) {
        isEggBirth = true;
        // tethers fade in
    } else if (globalCounter === 3) {
        isOvaCiliaBirth = true;
    }

    if (globalCounter > 3) {

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
                eggToTetLines.push(new THREE.Line(eggToTetLineGeometry, eggToTetLineMaterial))
                scene.add(eggToTetLines[tetCounter]);
            }
            tetCounter++;
        }

        // stage 2 - tendrils
        if (tetCounter == 11 && tendrilCounter < 5) {
           // const pos = getScreenPos(new THREE.Vector2(event.clientX, event.clientY))
            //addTendril(pos);
            addTendril(new Vector3(tet.position.x + tet.nodes[tendrilCounter].position.x,
                tet.position.y + tet.nodes[tendrilCounter].position.y,
                tet.position.z + tet.nodes[tendrilCounter].position.z));
            tendrilCounter++;
        }

        // stage 3 - cilia
        if (ciliaCounter++ == 15) {
            addCilia(3, .09, THREE.MathUtils.randFloat(.1, .7));
            isHoodReady = true;
        }

        if (isHoodReady && ciliaCounter > 16) {
            //addHood();
        }
    }

});

window.addEventListener('touchend', clearPickPosition);

function setPickPosition(event: Touch) { }
function clearPickPosition() { }
// END Touch events

// many bad magic nums down here. shameful.
function onMouse(event: MouseEvent) {
    globalCounter++;
    // 1st mouse press
    // egg wifreame fades in
    if (globalCounter === 1) {
        isOvaBirth = true;
        // knot core fade in
    } else if (globalCounter === 2) {
        isEggBirth = true;
        // tethers fade in
    } else if (globalCounter === 3) {
        isOvaCiliaBirth = true;
    }

    if (globalCounter > 3) {

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
                eggToTetLines.push(new THREE.Line(eggToTetLineGeometry, eggToTetLineMaterial))
                scene.add(eggToTetLines[tetCounter]);
            }
            tetCounter++;
        }

        // stage 2 - tendrils
        if (tetCounter == 11 && tendrilCounter < 5) {
            const pos = getScreenPos(new THREE.Vector2(event.clientX, event.clientY))
            //addTendril(pos);
            addTendril(new Vector3(tet.position.x + tet.nodes[tendrilCounter].position.x,
                tet.position.y + tet.nodes[tendrilCounter].position.y,
                tet.position.z + tet.nodes[tendrilCounter].position.z));
            tendrilCounter++;
        }

        // stage 3 - cilia
        if (ciliaCounter++ == 15) {
            addCilia(3, .09, THREE.MathUtils.randFloat(.1, .7));
            isHoodReady = true;
        }

        if (isHoodReady && ciliaCounter > 16) {
            //addHood();
        }
    }



}
