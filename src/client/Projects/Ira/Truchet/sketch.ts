// Truchet
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

// Project Description: 

import { AmbientLight, BoxGeometry, Color, DirectionalLight, Mesh, MeshBasicMaterial, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, SpotLight, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { randInt } from 'three/src/math/MathUtils';
import { HALF_PI, PI } from '../../../PByte3/IJGUtils';
import { Truchet } from './Truchet';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.x = 0;
camera.position.y = 0;
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
// Create/add outer box
const bounds: THREE.Vector3 = new Vector3(300, 300, 300);
const geomBox: BoxGeometry = new BoxGeometry(bounds.x, bounds.y, bounds.z);
const matBox: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x22ee00, wireframe: true, transparent: true, opacity: .1 });
const box: Mesh = new Mesh(geomBox, matBox);
scene.add(box);

let rows = 4;
let columns = 4;
let layers = 4;
let truchs = [];
let d = 40;
let shift = rows * d / 2;
let thetas = [PI, HALF_PI, -PI, -HALF_PI, PI + HALF_PI, -(PI + HALF_PI)];
for (let i = 0, l = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
        for (let k = 0; k < rows; k++) {
            truchs[l] = new Truchet(new Vector3(40, 40, 40));
            truchs[l].position.x = -shift + d * i;
            truchs[l].position.y = -shift + d * j;
            truchs[l].position.z = -shift + d * k;
            truchs[l].rotateX(thetas[randInt(0, 5)]);
            truchs[l].rotateY(thetas[randInt(0, 5)]);
            truchs[l].rotateZ(thetas[randInt(0, 5)]);

            scene.add(truchs[l]);
            l++;
        }
    }

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

    const time = Date.now() * 0.007;
    //pb.move(time);
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();



