// Title:  ClusterHead
// Author: Ira Greenberg, 11/2021
// Center of Creative Computation, SMU
// Dependencies: PByte.js, Three.js, 





import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { AmbientLight, BoxGeometry, BufferGeometry, DoubleSide, Line, LineBasicMaterial, Mesh, MeshPhongMaterial, PCFSoftShadowMap, PlaneGeometry, Scene, SpotLight, TextureLoader, Vector3 } from 'three';
import { VerletNode } from '../../PByte3/VerletNode';
import { PBMath } from '../../PByte3/IJGUtils';
import { VerletStick } from '../../PByte3/VerletStick';
import { BlockyHead } from './BlockyHead';
import { BlockyTorso } from './BlockyTorso';

const scene: Scene = new Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

//utilities
const axesHelper = new THREE.AxesHelper(500);
//scene.add(axesHelper);

// Custom Geometry
let head: BlockyHead = new BlockyHead(new Vector3(0, 1.75, 0),new Vector3(.8, .8, .8),1000);
 head.position.y += 1.75;//
//scene.add(head);


let torso: BlockyTorso = new BlockyTorso(new Vector3(0, 0, 0), new Vector3(2.5, 5, 1.5), new Vector3(3, 6, 2));
torso.position.y = 5.25;
scene.add(torso);

// ground plane
const geometry = new PlaneGeometry(400, 400);
const material = new MeshPhongMaterial({ color: 0x222222, opacity: 0.5, side: DoubleSide });
//material.opacity = 0.5;

const plane = new Mesh(geometry, material);
plane.rotateX(-Math.PI / 2);
// plane.castShadow = true;
plane.receiveShadow = true;

const texture = new TextureLoader().load("textures/ira_drawing01.jpg"); // in client directory or use http
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1);
plane.material.map = texture;


scene.add(plane);


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
light2.castShadow = true;

scene.add(light2);
//scene.add(light2.target);

const spot = new SpotLight(0xffa95c, 2);
spot.position.set(-30, 300, 50);
spot.castShadow = true;
spot.shadow.radius = 8; //doesn't workw ith PCFsoftshadows

spot.shadow.bias = -0.0001;
spot.shadow.mapSize.width = 1024 * 4;
spot.shadow.mapSize.height = 1024 * 4;
scene.add(spot);

camera.position.y = .8;
camera.position.z = 13;

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
    // head.hubHead.position.x = torso.position.x;
    // head.hubHead.position.y = torso.position.y;
    // head.hubHead.position.z = torso.position.z;
    torso.live();
    torso.groundCollide(plane.position.y);
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

