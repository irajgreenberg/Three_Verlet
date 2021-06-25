//Boilerplate Typescript/Three/VSCode, by Sean Bradley:
//git clone https://github.com/Sean-Bradley/js-TypeScript-Boilerplate.git





// For new projects:  1. npm install -g typescript, 
//                    2. npm install
// To run:            3. npm run dev 
//                    Server runs locally at port 3000

// These experiments support development
// of an 'independent' softbody organism.
// Work is being produced in collaboration with
// Courtney Brown, Melanie Clemmons & Brent Brimhall

// Draw a Verlet controlled solid
// contained within a cube

// Original Author: Ira Greenberg, 11/2020
// Center of Creative Computation, SMU
//----------------------------------------------


//import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, AmbientLight, DirectionalLight, TextureLoader, Vector3 } from 'three';
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, AmbientLight, DirectionalLight, TextureLoader, Vector3 } from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { AnchorPlane } from './PByte3/IJGUtils.js';
import { VerletPlane } from './PByte3/VerletPlane.js';


const scene: Scene = new Scene();
const camera: PerspectiveCamera = new PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.001, 2000);
const renderer: WebGLRenderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
document.addEventListener('click', onMouse, false);

//custom geometry
const texture = new TextureLoader().load("resources/orgImg.png");
let vp: VerletPlane = new VerletPlane(1, 1, 14, 24, texture, AnchorPlane.CORNER_ALL);
scene.add(vp);
vp.push([2, 3], new Vector3(.01, .02, 0));





// cube bounds
const bounds: Vector3 = new Vector3(2, 1.75, 1);


// Create/add outer box
const geometry2: BoxGeometry = new BoxGeometry(bounds.x, bounds.y, bounds.z);
const material2: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x22ee00, wireframe: true });
material2.transparent = true;
material2.opacity = .08;
const cube2: Mesh = new Mesh(geometry2, material2);
scene.add(cube2);

// Simple lighting calculations
const color = 0xEEEEFF;
const intensity = .65;
const light = new AmbientLight(color, intensity);
scene.add(light);

const color2 = 0xFFFFDD;
const intensity2 = 1;
const light2 = new DirectionalLight(color, intensity);
light2.position.set(-2, 6, 1);
//light2.target.position.set(0, 0, 0);
scene.add(light2);
//scene.add(light2.target);

camera.position.y = .05;
camera.position.z = 3;


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

    controls.update()
    render();
};


function onMouse(event: MouseEvent) {

}


function render() {
    renderer.render(scene, camera);
}
animate();






