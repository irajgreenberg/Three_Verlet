// Grows interactive hair on any line
// Author: Ira Greenberg, 10/2021
// Center of Creative Computation, SMU
// Dependencies: PByte.js, Three.js, 

// Node/TS/Three template:
//https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git



import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BufferGeometry, Color, Line3, Scene, Vector3 } from 'three';
import { VerletStrand } from '../PByte3/VerletStrand';
import { AnchorPoint } from '../PByte3/IJGUtils';

const scene: Scene = new Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

// Custom Geometry
// limb
const pts = [];
pts.push(new Vector3(-.82, 0, 0));
pts.push(new Vector3(.82, 0, 0));

const limbGeom = new BufferGeometry().setFromPoints(pts);
const limbMat = new THREE.LineBasicMaterial({ color: 0xEE8811 });
const limb = new THREE.Line(limbGeom, limbMat);
scene.add(limb);

// tendrils
const limbSegs = 300;
const limbGap = new Vector3(pts[1].x, pts[1].y, pts[1].z);
limbGap.sub(pts[0]);
limbGap.divideScalar(limbSegs);

const tendrils: VerletStrand[] = [];
for (let i = 0; i < limbSegs; i++) {
    tendrils[i] = new VerletStrand(new Vector3(pts[0].x + limbGap.x * i, pts[0].y, pts[0].z),
        new Vector3(pts[0].x + limbGap.x * i, pts[0].y + Math.random() * .3, pts[0].z + Math.random() * .3),
        10, AnchorPoint.HEAD);
    scene.add(tendrils[i]);
    tendrils[i].moveNode(1, new Vector3(-3 + Math.random() * 3, -3 + Math.random() * 3, -3 + Math.random() * 3));
    tendrils[i].setNodesScale(5);
    tendrils[i].setStrandMaterials(new Color(0xFFEEFF), .35);
    tendrils[i].setStrandOpacity(0); // start with invisible hair
    tendrils[i].setNodesOpacity(0); // start with invisible nodes
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

    // custom geometry
    for (let i = 0; i < limbSegs; i++) {
        tendrils[i].verlet();
    }

    controls.update()
    render();
}

let nodeScale = 1;
let isNodeScalable = true;

let nodeAlpha = 0;
let isNodeAlphable = true;

let strandAlpha = 0;
let isStrandAlphable = true;


// increase hair alpha, node alpha and node radius each click
function onMouse(event: MouseEvent) {
    for (let i = 0; i < tendrils.length; i++) {
        if (isNodeScalable) {
            tendrils[i].setNodesScale(nodeScale);
        }
        if (isNodeAlphable) {
            tendrils[i].setNodesOpacity(nodeAlpha);
        }

        if (isStrandAlphable) {
            tendrils[i].setStrandOpacity(strandAlpha);
        }
    }
    //NOTE: create vars in place of these magic nums.
    if ((nodeScale += .001) > 1.058) {
        isNodeScalable = false;
    }

    if ((nodeAlpha += .05) > .85) {
        isNodeAlphable = false;
    }

    if ((strandAlpha += .05) > 1) {
        isStrandAlphable = false;
    }
}

// Hair follows mouse postion on screen
// eventually perhaps use joint positions
function onMouseMove(event: MouseEvent) {
    for (let i = 0; i < tendrils.length; i++) {
        tendrils[i].moveNode(tendrils[i].nodes.length - 1,
            // ALERT: magic #'s
            new Vector3((event.x - window.innerWidth / 2) * .000004, -(event.y - window.innerHeight / 2) * .000009, 0));
    }
}


function render() {
    renderer.render(scene, camera);
}
animate();






