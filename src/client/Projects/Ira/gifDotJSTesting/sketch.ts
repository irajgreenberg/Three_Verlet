// gifDotJSTesting
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

// Project Description: 

import { AmbientLight, Color, DirectionalLight, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, SpotLight, WebGLRenderer } from 'three'
//import { AnimationClipCreator } from 'three/examples/jsm/animation/AnimationClipCreator'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { gifDotJSTesting } from './gifDotJSTesting';
import * as CanvasCapture from 'canvas-capture';


// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 400;

// let aaa: AnimationClipCreator;
const scene = new Scene();
scene.background = new Color(0x00000);

// main renderer
var canvas = document.getElementById("canvasID");
let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

/****************** Custom geometry *******************/
let b = new gifDotJSTesting();
scene.add(b);
/******************************************************/

const ambientTexturesLight = new AmbientLight(0xFFFFFF, 1);
scene.add(ambientTexturesLight);

const col2 = 0xffffff;
const intensity = 1;
const light = new DirectionalLight(col2, intensity);
light.position.set(15.2, -10.2, 30);
light.castShadow = true;
scene.add(light);

const spot = new SpotLight(0xffffff, 1);
spot.position.set(-2, 8, 5);
spot.castShadow = true;
spot.shadow.radius = 8; //doesn't work with PCFsoftshadows
spot.shadow.bias = -0.0001;
spot.shadow.mapSize.width = 1024 * 4;
spot.shadow.mapSize.height = 1024 * 4;
scene.add(spot);

const pointLt = new PointLight(0xff0000, 1, 200); light.position.set(0, 50, 0); scene.add(pointLt);

// for gif export
const ctx = document.createElement('canvas')

// Initialize and pass in canvas.
CanvasCapture.init(ctx, {
    verbose: true, // Verbosity of console output, default is true,
    showAlerts: true, // Show alert dialogs, default is true.
    showDialogs: true, // Show informational dialogs, default is true.
    showRecDot: true, // Show a red dot on the screen during records, defaults is true.
    recDotCSS: {
        right: '0', top: '0', margin: '10px'
    }
});

// Bind key presses to begin/end recordings.
CanvasCapture.bindKeyToVideoRecord('v', {
    name: 'myVideo', // Options are optional, more info below.
    quality: 0.6,
});
CanvasCapture.bindKeyToGIFRecord('g');
// These take a single snapshot.
CanvasCapture.bindKeyToPNGSnapshot('p');
CanvasCapture.bindKeyToJPEGSnapshot('j', {
    name: 'myJpeg', // Options are optional, more info below.
    quality: 0.8,
});


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    controls.autoRotate = true;

    const time = Date.now() * 0.007;
    b.move(time);
    render();
}

function render() {
    if (CanvasCapture.isRecording()) CanvasCapture.recordFrame();
    renderer.render(scene, camera);
}
animate();



