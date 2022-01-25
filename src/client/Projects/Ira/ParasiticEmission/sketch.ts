// Parasitic Emission, 2022
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

// Project Description: 

import { AmbientLight, Color, DirectionalLight, HemisphereLight, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, SpotLight, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { randFloat } from 'three/src/math/MathUtils';
import { ParasiticEmission } from './ParasiticEmission';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 20000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 600;

const scene = new Scene();
let greyCol = Math.random() * .2;
const myColor = new Color(greyCol, greyCol, greyCol);
scene.background = myColor;
document.body.style.backgroundColor = '#' + myColor.getHexString();

// main renderer
let renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = true;
controls.enablePan = false;

let pc = new ParasiticEmission();
/****************** Custom geometry *******************/
scene.add(pc);
/******************************************************/

const ambientTexturesLight = new AmbientLight(0xDDDDDD + Math.random() * 0x333333, randFloat(.1, .4));
scene.add(ambientTexturesLight);

const hemiLt = new HemisphereLight((Math.random() * 0xffffff, Math.random() * 0xffffff) * randFloat(.1, .3), randFloat(.1, 8.5));
scene.add(hemiLt);

const col2 = 0xFFFFFF;
const intensity = .9;
const light = new DirectionalLight(col2, intensity);
light.position.set(15.2, 125.2, 180);
light.castShadow = true;
scene.add(light);

// const spot = new SpotLight(0xff0000, .65);
// spot.position.set(-70, 300, 50);
// spot.castShadow = true;
// spot.shadow.radius = 8; //doesn't work with PCFsoftshadows
// spot.shadow.bias = -0.0001;
// spot.shadow.mapSize.width = 1024 * 4;
// spot.shadow.mapSize.height = 1024 * 4;
// scene.add(spot);

const pointLt = new PointLight(0xff0000, 1, 100); light.position.set(0, 140, 100);
scene.add(pointLt);

function animate() {
    requestAnimationFrame(animate);
    // renderer.setClearColor(0xFFFFFF, 0);
    controls.update();
    // controls.autoRotate = true;

    const time = Date.now() * 0.007;
    pc.move(time);
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();



