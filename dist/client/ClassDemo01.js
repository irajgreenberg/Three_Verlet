//Boilerplate Typescript/Three/VSCode, by Sean Bradley:
//git clone https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate.git
import { AnchorPlane } from './PByte3/IJGUtils.js';
import { VerletPlane } from './PByte3/VerletPlane.js';
import { Scene, TextureLoader, Vector3 } from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import * as THREE from '/build/three.module.js';
const scene = new Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);
//custom geometry
const texture = new TextureLoader().load("resources/orgImg.png");
let vp = new VerletPlane(3, 3, 35, 35, texture, AnchorPlane.EDGES_ALL);
scene.add(vp);
// push middle node to start verlet
//vp.push([vp.middleNodeIndex], new Vector3(.23, -.3, -.9));
//vp.setNodesOff(AnchorPlane.CORNER_ALL);
vp.setNodesOff(AnchorPlane.EDGES_ALL);
vp.setNormalsVisible(true);
// for testing interaction with mesh
let theta = 0;
// cube bounds
const bounds = new THREE.Vector3(8, 8, 8);
// Create/add outer box
const geometry2 = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2 = new THREE.MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
material2.transparent = true;
material2.opacity = .08;
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add(cube2);
//+++++Begin some collision testing
let ballPos = new Vector3(0, 1, 0);
let ballSpd = new Vector3(.01, -.001, .02);
let grav = -.003;
let ballRad = .02;
const geometry = new THREE.SphereGeometry(ballRad, 32, 16);
const material = new THREE.MeshPhongMaterial({ color: 0x443322 });
const sphere = new THREE.Mesh(geometry, material);
sphere.position.x = ballPos.x;
sphere.position.y = ballPos.y;
sphere.position.z = ballPos.z;
scene.add(sphere);
//+++++End Collision testing++++++//
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
    vp.showPatchNormals();
    // console.log("centroid = ", vp.quads[20].getCentroid());
    // console.log("normal = ", vp.quads[20].getNormal());
    theta += 1;
    //move sphere
    sphere.position.x += ballSpd.x;
    ballSpd.y += grav;
    sphere.position.y += ballSpd.y;
    sphere.position.z += ballSpd.z;
    //check sphere-plane collision
    // if
    controls.update();
    render();
};
function onMouse(event) {
}
function render() {
    renderer.render(scene, camera);
}
animate();
