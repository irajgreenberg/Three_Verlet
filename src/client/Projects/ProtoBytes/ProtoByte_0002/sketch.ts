// Ira Greenberg
// Bacon Bits Collective
// Dallas, TX

// Skinned & Animated ProtoByteTube Example

import { AmbientLight, Color, DirectionalLight, Material, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, SkinnedMesh, SpotLight, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ProtoByte_0000 } from '../ProtoByte_0000/ProtoByte_0000';
import { ProtoByte_0001 } from '../ProtoByte_0001/ProtoByte_0001';
import { ProtoByte_0002 } from './ProtoByte_0002';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 300;

const scene = new Scene();
scene.background = new Color(0x002222);

// main renderer
let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

//****************** Custom geometry ******************//
let pb0 = new ProtoByte_0000(new Vector3(80, 300, 80));
//pb1.rotateX(Math.PI / 2);
pb0.skinMesh!.scale.x = .3;
pb0.skinMesh!.scale.y = .3;
pb0.skinMesh!.scale.z = .3;

scene.add(pb0);


let pb1 = new ProtoByte_0001(new Vector3(80, 300, 80));
pb1.rotateX(Math.PI / 2);
scene.add(pb1);
//*****************************************************//


const ambientTexturesLight = new AmbientLight(0xFFFFFF, .45);
scene.add(ambientTexturesLight);

const col2 = 0xffffff;
const intensity = 1;
const light = new DirectionalLight(col2, intensity);
light.position.set(15.2, -10.2, 300);
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

const pointLt = new PointLight(0xff0000, 1, 400); light.position.set(-100, 50, 500); scene.add(pointLt);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // controls.autoRotate = true;
    pb1.rotateY(Math.PI / 1024);
    pb1.rotateZ(-Math.PI / 1024);

    const time = Date.now() * 0.007;

    pb0.move(time);
    pb1.move(time);
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();



