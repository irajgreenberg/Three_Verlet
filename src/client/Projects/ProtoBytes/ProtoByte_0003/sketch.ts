// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

// Skinned & Animated ProtoByteTube Example

import { AmbientLight, Color, DirectionalLight, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, SpotLight, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { randFloat } from 'three/src/math/MathUtils';
import { PBMath, PI } from '../../../PByte3/IJGUtils';
import { ProtoByte_0003 } from './ProtoByte_0003';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.x = 200;
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

//****************** Custom geometry ******************//
// let pb0 = new ProtoByte_0003(new Vector3(40, 300, 40));
// pb0.translateX(-190)
// pb0.rotateZ(PI / 2);

// scene.add(pb0);

// let pb1 = new ProtoByte_0003(new Vector3(40, 300, 40));
// pb1.translateX(190)
// pb1.rotateZ(-PI / 2);
// scene.add(pb1);

let wormCount = 50;
let worms: ProtoByte_0003[] = [];
for (let i = 0; i < wormCount; i++) {
    let rad = PBMath.rand(10, 50);
    let len = PBMath.rand(275, 400);
    let offset = 100;
    worms[i] = new ProtoByte_0003(new Vector3(rad, len, rad));
    worms[i].translateX(PBMath.rand(-offset, offset))
    worms[i].translateY(PBMath.rand(-offset, offset))
    worms[i].translateZ(PBMath.rand(-offset, offset))
    worms[i].rotateX(randFloat(-PI, PI));
    worms[i].rotateY(randFloat(-PI, PI));
    worms[i].rotateZ(randFloat(-PI, PI));
    scene.add(worms[i]);
}

//*****************************************************//


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

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    controls.autoRotate = true;


    // pb0.move(time);
    // pb1.move(time);

    for (let i = 0; i < wormCount; i++) {
        const time = Date.now() * 0.002 * (i + 1) * .02;
        worms[i].move(time);
    }
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();



