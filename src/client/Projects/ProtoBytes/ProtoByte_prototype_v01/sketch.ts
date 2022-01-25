// ProtoByte_prototype_v01
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

// Project Description: 

import { AmbientLight, Color, DirectionalLight, FogExp2, Group, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, SpotLight, Vector3, WebGLRenderer, BufferGeometry, LineBasicMaterial, InstancedMesh, Matrix4, DynamicDrawUsage, InstancedBufferGeometry, MeshBasicMaterial, BoxGeometry, Box3, Mesh, MeshLambertMaterial, PlaneBufferGeometry, RepeatWrapping, TextureLoader, MeshStandardMaterial } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { cos, PI, sin } from '../../../PByte3/IJGUtils';
import { ProtoByte_prototype_v01 } from './ProtoByte_prototype_v01';
import { randFloat } from 'three/src/math/MathUtils';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 400;

const scene = new Scene();
scene.background = new Color(0x332233);
const worldBounds = new Box3(new Vector3(-700, -400, -300), new Vector3(700, 400, 30))
const particulateTurbulance = 4;

//scene.fog = new Fog(scene.background, 0.0028, 1200);
scene.fog = new FogExp2(0x332233, 0.0018)

// ground plane
let tex = new TextureLoader().load("textures/bumpySand.jpg")
let texNormal = new TextureLoader().load("textures/bumpySand_normalMap.jpg")
tex.anisotropy = 32
tex.repeat.set(50, 50)
texNormal.repeat.set(50, 50)
tex.wrapT = RepeatWrapping
tex.wrapS = RepeatWrapping
let geo = new PlaneBufferGeometry(10000, 10000)
let mat = new MeshStandardMaterial({
    map: tex, normalMap: texNormal, transparent: true, opacity: .55
})
let mesh = new Mesh(geo, mat)
mesh.receiveShadow = true;
mesh.position.set(0, -400, 0)
mesh.rotation.set(Math.PI / -2, 0, 0)
scene.add(mesh)


//
// floating particulate
let particulateCount = 30000;
let pos: Vector3[] = [];
let spd: Vector3[] = [];
let spdInit: Vector3[] = []; // capture initial speed to reset after turbulance
let damping = .75;
let turbulance: Vector3;
let particulateGeom: BoxGeometry;
let particulateMat: MeshBasicMaterial;
let particulateIMesh: InstancedMesh;
let m: Matrix4[] = [];


for (let i = 0; i < particulateCount; i++) {
    pos[i] = new Vector3(randFloat(worldBounds.min.x * 1.5, worldBounds.max.x * 1.5), randFloat(worldBounds.min.y * 1.5, worldBounds.max.y * 1.5), randFloat(worldBounds.min.z * 1.5, worldBounds.max.z * 1.5));
    spd[i] = new Vector3(randFloat(-.37, .37), randFloat(-.37, .37), randFloat(-.37, .37));
    spdInit[i] = new Vector3().set(spd[i].x, spd[i].y, spd[i].z);
    m[i] = new Matrix4();
    m[i].setPosition(pos[i]);
}
turbulance = new Vector3(randFloat(-.2, .2), randFloat(-.2, .2), randFloat(-.2, .2));

particulateGeom = new BoxGeometry(.7, .7, .7);
particulateMat = new MeshBasicMaterial({ color: 0xAA7733, transparent: true, opacity: .35, wireframe: true })
particulateIMesh = new InstancedMesh(particulateGeom, particulateMat, particulateCount);
particulateIMesh.instanceMatrix.setUsage(DynamicDrawUsage);
scene.add(particulateIMesh);



// main renderer
let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

//****************** Custom geometry ******************//
let pb = new ProtoByte_prototype_v01(new Vector3(30, 300, 30));
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
light.position.set(0, 560.2, 10);
light.castShadow = true;
scene.add(light);

const spot = new SpotLight(0xffffff, 1);
spot.position.set(0, 560, 10);
spot.castShadow = true;
spot.shadow.radius = 8; //doesn't work with PCFsoftshadows
spot.shadow.bias = -0.0001;
spot.shadow.mapSize.width = 1024 * 4;
spot.shadow.mapSize.height = 1024 * 4;
scene.add(spot);

const pointLt = new PointLight(0xff0000, 1, 0); light.position.set(0, 560, 10); scene.add(pointLt);
//pbGroup.translateX(200);
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // controls.autoRotate = true;

    const time = Date.now() * 0.3;
    pb.move(time);
    let z = cos(time * PI / 2780) * 320
    let x = sin(time * PI / 2780) * 320

    // uncomment for swimming
    pbGroup.position.x = x;
    pbGroup.position.z = z - 100;
    pbGroup.position.y = sin(time * PI / 2780) * 150 + 45
    pb.rotation.y = Math.atan2(x, z)

    const aabb = new Box3().setFromObject(pb);
    //particulate
    for (let i = 0; i < particulateCount; i++) {
        let p = particulateIMesh.getObjectById(i);
        particulateIMesh.setMatrixAt(i, m[i]);
        particulateIMesh.instanceMatrix.needsUpdate = true;
        m[i].setPosition(pos[i]);
        pos[i].add(spd[i]);

        if (pb.boundingBox) {
            // console.log("pbGroup = ", pbGroup.position);
            if (pos[i].distanceTo(pbGroup.position) < 230) {
                turbulance.x = randFloat(-particulateTurbulance, particulateTurbulance);
                turbulance.y = randFloat(-particulateTurbulance, particulateTurbulance);
                turbulance.z = randFloat(-particulateTurbulance, particulateTurbulance);
                spd[i].add(turbulance);
            }
            if (spd[i].length() >= spdInit[i].length()) {
                spd[i].multiplyScalar(damping);
            } else {
                // spd[i].set(spdInit[i].x, spdInit[i].y, spdInit[i].z);
            }
        }

        if (pos[i].x > worldBounds.max.x) {
            pos[i].x = worldBounds.min.x;
        } else if (pos[i].x < worldBounds.min.x) {
            pos[i].x = worldBounds.max.x;
        }
        if (pos[i].y > worldBounds.max.y) {
            pos[i].y = worldBounds.min.y;
        } else if (pos[i].y < worldBounds.min.y) {
            pos[i].y = worldBounds.max.y;
        }
        if (pos[i].z > worldBounds.max.z) {
            pos[i].z = worldBounds.min.z;
        } else if (pos[i].z < worldBounds.min.z) {
            pos[i].z = worldBounds.max.z;
        }

    }

    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();

function floatRand(arg0: number, arg1: number): number | undefined {
    throw new Error('Function not implemented.');
}

