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
import { BlockyHead } from './BlockyHead';
import { BlockyTorso } from './BlockyTorso';

const scene: Scene = new Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

//utilities
const axesHelper = new THREE.AxesHelper(500);
//scene.add(axesHelper);

// Custom Geometry
let head: BlockyHead = new BlockyHead();
//scene.add(head);
head.position.y += 1.75;

let torso: BlockyTorso = new BlockyTorso(new Vector3(1.5, 2, 1.5), new Vector3(3, 3, 3));
scene.add(torso);
//torso.position.y -= 1.75;

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
    head.live();
    torso.live();
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

