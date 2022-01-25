// Tubemergence
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

// Project Description: 

import { AmbientLight, Clock, Color, DirectionalLight, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, SpotLight, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Tubemergence } from './Tubemergence';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.x = 0;
camera.position.y = 100;
camera.position.z = 400;

const scene = new Scene();
scene.background = new Color(0x00000);

// main renderer
let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

/****************** Custom geometry *******************/
let te = new Tubemergence();
scene.add(te);
/******************************************************/

const ambientTexturesLight = new AmbientLight(0xFFFFFF, .7);
scene.add(ambientTexturesLight);

const col2 = 0xffEEEE;
const intensity = 1;
const light = new DirectionalLight(col2, intensity);
light.position.set(-15.2, 200.2, -200);
light.castShadow = true;
scene.add(light);

const spot = new SpotLight(0xffffff, 1);
spot.position.set(-100, 200, -200);
spot.castShadow = true;
spot.shadow.radius = 8; //doesn't work with PCFsoftshadows
spot.shadow.bias = -0.0001;
spot.shadow.mapSize.width = 1024 * 4;
spot.shadow.mapSize.height = 1024 * 4;
scene.add(spot);

const pointLt = new PointLight(0xff0000, 1, 200); light.position.set(-75, 150, 0); scene.add(pointLt);

const time = new Clock();
// time.start();
// let delta = time.getDelta();
let ctr = 0;


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    controls.autoRotate = true;

    te.move(ctr++);

    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();



