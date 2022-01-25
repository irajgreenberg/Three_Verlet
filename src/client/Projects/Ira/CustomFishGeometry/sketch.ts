// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX


import { AmbientLight, AnimationMixer, Color, DirectionalLight, PCFSoftShadowMap, PerspectiveCamera, Scene, SpotLight, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 45;

const scene = new Scene();
scene.background = new Color(0xAABBFF);

// main renderer
let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// based on main scene camera
const controls = new OrbitControls(camera, renderer.domElement);

const ambientTexturesLight = new AmbientLight(0xFFFFFF, 1);
scene.add(ambientTexturesLight);

const col2 = 0x9999aa;
const intensity = 1;
const light = new DirectionalLight(col2, intensity);
light.position.set(15.2, -10.2, -12);
light.castShadow = true;
scene.add(light);

const spot = new SpotLight(0x9999aa, 1);
spot.position.set(-2, 8, 20);
spot.castShadow = true;
spot.shadow.radius = 8; //doesn't work with PCFsoftshadows
spot.shadow.bias = -0.0001;
spot.shadow.mapSize.width = 1024 * 4;
spot.shadow.mapSize.height = 1024 * 4;
scene.add(spot);

let plumpFish
let fbxLoader = new FBXLoader();
fbxLoader.load('models/plumpFish02.fbx', function (object) {
    plumpFish = object;
    object.scale.x = .15;
    object.scale.y = .15;
    object.scale.z = .15;
    object.position.z -= 260;
    plumpFish.rotateY(Math.PI / 2);

    // mixer = new AnimationMixer(object);
    // const action = mixer.clipAction(object.animations[1]);
    // action.play();

    scene.add(object);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();