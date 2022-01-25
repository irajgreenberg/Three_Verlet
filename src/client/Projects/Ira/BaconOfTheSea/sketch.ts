// Fish model 01

// Code appropriated from:
// https://threejsfundamentals.org/threejs/lessons/threejs-canvas-textures.html

import { AmbientLight, AnimationMixer, BoxGeometry, CanvasTexture, ClampToEdgeWrapping, Clock, Color, DirectionalLight, Group, LoadingManager, MaterialLoader, Mesh, MeshBasicMaterial, MeshPhongMaterial, MirroredRepeatWrapping, Object3D, PCFSoftShadowMap, PerspectiveCamera, RepeatWrapping, Scene, SphereGeometry, SpotLight, TextureLoader, Vector2, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'
import { PBMath } from '../../../PByte3/IJGUtils';


// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 45;
camera.position.y = 0;

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


loadModel();
let mixer: AnimationMixer;

const clock = new Clock();
let whale: Group;
let yellow: Group

function loadModel() {
    let mtlLoader = new MTLLoader();
    mtlLoader.load('models/discus_fish_obj/discus_fish.mtl', function (materials) {
        materials.preload();

        console.log(materials);

        let objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('models/discus_fish_obj/discus_fish.obj', function (object) {
            //object.position.y -= 60;
            yellow = object;
            object.scale.x = .45;
            object.scale.y = .45;
            object.scale.z = .45;
            scene.add(object);
        });
    });

    let daeLoader = new ColladaLoader();
    daeLoader.load('models/fish.dae', function (object) {
        //object.position.y -= 60;
        scene.add(object.scene.children[2]);
    });

    let objLoader = new OBJLoader();
    objLoader.load('models/Fish.obj', function (object) {

        // scene.add(object);
    });

    let fbxLoader = new FBXLoader();
    fbxLoader.load('models/Whale.fbx', function (object) {
        whale = object;
        object.scale.x = .15;
        object.scale.y = .15;
        object.scale.z = .15;
        object.position.z -= 260;
        whale.rotateY(Math.PI / 2);

        mixer = new AnimationMixer(object);
        const action = mixer.clipAction(object.animations[1]);
        action.play();

        scene.add(object);
    });
}
let ctr = 0;
let ctr2 = 0;
let ctr3 = 0;
let bob = 0;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    const delta = clock.getDelta();
    const delta2 = clock.getDelta();
    if ((mixer as AnimationMixer)) {
        mixer.update(delta);

    }
    whale.position.z = -260 + Math.cos(ctr) * 150;
    whale.position.x = Math.sin(ctr) * 150;
    whale.position.y = Math.cos(ctr2) * 10;
    whale.rotateY(Math.PI / 4 * .0111);


    yellow.position.z = -180 + Math.cos(ctr) * 180;
    yellow.position.x = Math.sin(-ctr) * 40;
    yellow.position.y = bob + Math.cos(-ctr3) * 1;
    yellow.rotateY(-Math.PI / 4 * .0111);
    bob = Math.sin(ctr) * 50;

    ctr += Math.PI / 360;
    ctr2 += Math.PI / 90;
    ctr3 += Math.PI / 40;

    // required to see texture changes each animation frame
    //texture.needsUpdate = true;
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();