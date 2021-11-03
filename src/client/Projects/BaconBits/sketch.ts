// Title:  ClusterHead
// Author: Ira Greenberg, 11/2021
// Center of Creative Computation, SMU
// Dependencies: PByte.js, Three.js, 





import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { AmbientLight, BoxGeometry, BufferGeometry, Line, LineBasicMaterial, Mesh, MeshPhongMaterial, Scene, Vector3 } from 'three';
import { VerletNode } from '../../PByte3/VerletNode';
import { PBMath } from '../../PByte3/IJGUtils';
import { VerletStick } from '../../PByte3/VerletStick';


const scene: Scene = new Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

// Custom Geometry
// 200 random cubbies
const NODE_COUNT = 2000;
const nodes: VerletNode[] = [];
const hubNeck: VerletNode = new VerletNode(new Vector3(0, -1.5, 0));
const hubHead: VerletNode = new VerletNode(new Vector3(0));
const hubHeadStrap: VerletNode = new VerletNode(new Vector3(0, 1.5, 0));
const sticks: VerletStick[] = [];
const blocks: Mesh[] = [];

const gravity = 0;
for (let i = 0; i < NODE_COUNT; i++) {
    let theta = Math.random() * Math.PI * 2;
    let radius = PBMath.rand(.2, .9);
    // random z rot
    let x = Math.cos(theta) * radius;
    let y = Math.sin(theta) * radius;
    let z = 0;
    // random y rot
    let phi = Math.random() * Math.PI * 2;
    let z2 = z * Math.cos(phi) - x * Math.sin(phi)
    let x2 = z * Math.sin(phi) + x * Math.cos(phi)
    let y2 = y;
    nodes[i] = new VerletNode(new Vector3(x2, y2, z2), .02);
    // scene.add(nodes[i]);

    sticks[i] = new VerletStick(hubHead, nodes[i], .01);
    //scene.add(sticks[i]);

    let geom: BoxGeometry = new BoxGeometry(PBMath.rand(.01, .14), PBMath.rand(.01, .14), PBMath.rand(.01, .14));
    let mat: MeshPhongMaterial = new MeshPhongMaterial({ color: 0x225588 });
    blocks[i] = new Mesh(geom, mat);
    blocks[i].rotateX(PBMath.rand(-Math.PI / 15, Math.PI / 15));
    blocks[i].rotateY(PBMath.rand(-Math.PI / 15, Math.PI / 15));
    blocks[i].rotateZ(PBMath.rand(-Math.PI / 15, Math.PI / 15));
    scene.add(blocks[i]);
}
// neck and head straps
sticks.push(new VerletStick(hubNeck, hubHead, .3, 1));
sticks.push(new VerletStick(hubHeadStrap, hubHead, .875, 1));
// scene.add(sticks[sticks.length - 2]);
// scene.add(sticks[sticks.length - 1]);
hubHead.moveNode(new Vector3(5.2, .15, -.145));

let randNodeindex = 0;
for (let i = 0, k = 0, l = 0; i < nodes.length; i++) {
    // cross-supports
    let val = Math.floor(Math.random() * (nodes.length - 1));
    if (i % 1 === 0 && i !== val) {
        sticks.push(new VerletStick(nodes[i], nodes[val], 1, 0));

    }
    // hairs
    // to do
}




// cube bounds
const bounds: THREE.Vector3 = new THREE.Vector3(2.2, 2.2, 2.2);

// Create/add outer box
const geometry2: THREE.BoxGeometry = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
material2.transparent = true;
material2.opacity = .08;
const cube2: THREE.Mesh = new THREE.Mesh(geometry2, material2);
//scene.add(cube2);

// Simple lighting calculations
const color = 0xEEEEFF;
const intensity = .85;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const color2 = 0xFFFFDD;
const intensity2 = 1;
const light2 = new THREE.DirectionalLight(color, intensity);
light2.position.set(-2, 6, 1);

scene.add(light2);
//scene.add(light2.target);

camera.position.y = .8;
camera.position.z = 6;

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
    hubHead.verlet();
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].verlet();
        blocks[i].position.x = nodes[i].position.x
        blocks[i].position.y = nodes[i].position.y += gravity;
        blocks[i].position.z = nodes[i].position.z
    }


    for (let i = 0; i < sticks.length; i++) {
        sticks[i].constrainLen();
    }
    controls.update()
    render();
}


function onMouse(event: MouseEvent) {

}


function onMouseMove(event: MouseEvent) {

}

function render() {
    renderer.render(scene, camera);
}
animate();






function random(arg0: number, arg1: number): number | undefined {
    throw new Error('Function not implemented.');
}

