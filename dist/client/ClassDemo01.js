//Boilerplate Typescript/Three/VSCode, by Sean Bradley:
//git clone https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git
import { AnchorPlane } from './PByte3/IJGUtils.js';
import { VerletPlane } from './PByte3/VerletPlane.js';
import * as THREE from '/build/three.module.js';
//import * as THREE from 'three';
import { TextureLoader, Vector3 } from '/build/three.module.js';
//import { TextureLoader, Vector3 } from 'three';
import { OrbitControls } from '/jsm/controls/OrbitControls';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);
//custom geometry
const texture = new TextureLoader().load("resources/orgImg.png");
let vp = new VerletPlane(3, 3, 25, 25, texture, AnchorPlane.EDGES_ALL);
scene.add(vp);
// push middle node to start verlet
//vp.push([vp.middleNodeIndex], new Vector3(.23, -.3, -.9));
//vp.setNodesOff(AnchorPlane.CORNER_ALL);
vp.setNodesOff(AnchorPlane.EDGES_ALL);
// for teting interaction with mesh
let theta = 0;
//draw normal
// let lm = new THREE.LineBasicMaterial({ color: 0xFF9900 });
// let lg = new THREE.Geometry()
// lg.vertices.push(vp.quads[30].getCentroid());
// lg.vertices.push(vp.quads[30].getNormal().multiplyScalar(-.25));
// let ln = new THREE.Line(lg, lm);
// lm.transparent = true;
// lm.opacity = .95;
// scene.add(ln);
//end draw normal
// cube bounds
const bounds = new THREE.Vector3(8, 8, 8);
// Create/add outer box
const geometry2 = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2 = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
material2.transparent = true;
material2.opacity = .08;
const cube2 = new THREE.Mesh(geometry2, material2);
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
camera.position.y = .8;
camera.position.z = 2;
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
    vp.verlet();
    vp.constrain(bounds);
    // don't push edge nodes or plane becomes unstable
    let index = Math.floor(Math.random() * vp.bodyNodes.length);
    let node = vp.bodyNodes[index];
    let amp = Math.random() * .4;
    vp.moveNode(node, new Vector3(0, Math.sin(theta * Math.PI / 5) * amp, 0));
    // console.log("centroid = ", vp.quads[20].getCentroid());
    // console.log("normal = ", vp.quads[20].getNormal());
    theta += 1;
    controls.update();
    render();
};
function onMouse(event) {
}
function render() {
    renderer.render(scene, camera);
}
animate();
