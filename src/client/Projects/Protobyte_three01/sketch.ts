// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX


import { AmbientLight, Bone, CatmullRomCurve3, Color, DirectionalLight, Float32BufferAttribute, LineSegments, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, Skeleton, SkeletonHelper, SkinnedMesh, SphereGeometry, SpotLight, Uint16BufferAttribute, Vector3, WebGLRenderer, WireframeGeometry } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PBMath } from '../../PByte3/IJGUtils';
import { ProtoTubeGeometry } from '../../PByte3/ProtoTubeGeometry';
import { Protobyte } from './Protobyte';
import { ProtoTube } from './ProtoTube';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 350;

const scene = new Scene();
scene.background = new Color(0x00000);

// main renderer
let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// based on main scene camera
const controls = new OrbitControls(camera, renderer.domElement);


// ***********************************
// Begin custom geometry
let pb = new Protobyte();
pb.receiveShadow = true;
scene.add(pb);

// let vecs: Vector3[] = [];
// let theta = 0;
// let phi = 0;
// for (let i = 0; i < 75; i++) {
//     vecs[i] = new Vector3(Math.sin(theta += Math.PI / PBMath.rand(i, i + 10)) * i, 145 - i * 3.4, Math.cos(theta += Math.PI / (i + 1)) * -i);
// }
// let curve = new CatmullRomCurve3(vecs);
// let tube1 = new ProtoTube(curve, 2.75, new Color(0x441177), 60, 4);
// scene.add(tube1);

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
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();


