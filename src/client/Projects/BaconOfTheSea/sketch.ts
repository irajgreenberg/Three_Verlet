// Fish model 01

// Code appropriated from:
// https://threejsfundamentals.org/threejs/lessons/threejs-canvas-textures.html

import { AmbientLight, BoxGeometry, CanvasTexture, ClampToEdgeWrapping, Color, DirectionalLight, Group, LoadingManager, MaterialLoader, Mesh, MeshBasicMaterial, MeshPhongMaterial, MirroredRepeatWrapping, Object3D, PCFSoftShadowMap, PerspectiveCamera, RepeatWrapping, Scene, SphereGeometry, SpotLight, TextureLoader, Vector2, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { PBMath } from '../../PByte3/IJGUtils';


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


function loadModel() {
    let mtlLoader = new MTLLoader();
    mtlLoader.load('models/discus_fish_obj/discus_fish.mtl', function (materials) {
        materials.preload();

        console.log(materials);

        let objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('models/discus_fish_obj/discus_fish.obj', function (object) {
            //object.position.y -= 60;
            scene.add(object);
        });
    });

}


function animate() {
    requestAnimationFrame(animate);
    controls.update();


    // required to see texture changes each animation frame
    //texture.needsUpdate = true;
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();