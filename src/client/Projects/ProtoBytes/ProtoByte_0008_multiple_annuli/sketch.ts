// Protobyte_0008
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

// Project Description: 

import { AmbientLight, Color, DirectionalLight, Fog, FogExp2, Group, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, SpotLight, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { cos, PI, sin } from '../../../PByte3/IJGUtils';
import { Protobyte_0008 } from './Protobyte_0008';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 400;

const scene = new Scene();
scene.background = new Color(0x332233);

//scene.fog = new Fog(scene.background, 0.0028, 1200);
scene.fog = new FogExp2(0x332233, 0.0018)


// main renderer
let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

//****************** Custom geometry ******************//
let pb = new Protobyte_0008(new Vector3(30, 300, 30));
let pbGroup = new Group();
pbGroup.add(pb);
//pb.translateX(250);
pb.rotateZ(PI / 2);
scene.add(pbGroup);
//pb.rotateX(PI / 2)
//*****************************************************//


const ambientTexturesLight = new AmbientLight(0xFFFFFF, .7);
scene.add(ambientTexturesLight);

const col2 = 0xffEEEE;
const intensity = 1;
const light = new DirectionalLight(col2, intensity);
light.position.set(15.2, -10.2, 180);
light.castShadow = true;
scene.add(light);

const spot = new SpotLight(0xffffff, 1);
spot.position.set(-2, 100, 150);
spot.castShadow = true;
spot.shadow.radius = 8; //doesn't work with PCFsoftshadows
spot.shadow.bias = -0.0001;
spot.shadow.mapSize.width = 1024 * 4;
spot.shadow.mapSize.height = 1024 * 4;
scene.add(spot);

const pointLt = new PointLight(0xff0000, 1, 200); light.position.set(0, 50, 100); scene.add(pointLt);
//pbGroup.translateX(200);
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // controls.autoRotate = true;

    const time = Date.now() * 0.3;
    pb.move(time);
    let z = cos(time * PI / 2780) * 320
    let x = sin(time * PI / 2780) * 320

    pbGroup.position.x = x;
    pbGroup.position.z = z - 100;
    pbGroup.position.y = sin(time * PI / 2780) * 150 + 45
    // pbGroup.translateZ(z)
    // pbGroup.translateX(x)
    //pbGroup.trans
    // pbGroup.rotation.x = (time * PI / 720) * .6;
    pb.rotation.y = Math.atan2(x, z)
    //pb.rotation.z = time * PI / 2780


    //pb.rotateZ(Math.atan2(z, x));

    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();



