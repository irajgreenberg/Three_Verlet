// // Ira Greenberg
// // Bacon Bits Cooperative
// // Dallas, TX


// import { AmbientLight, Bone, CatmullRomCurve3, Color, DirectionalLight, Float32BufferAttribute, LineSegments, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, Skeleton, SkeletonHelper, SkinnedMesh, SphereGeometry, SpotLight, Vector3, WebGLRenderer } from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { ProtoByte_0000 } from './Protobyte_0000';

// // create and position camera
// const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 400;

// const scene = new Scene();
// scene.background = new Color(0x00000);

// // main renderer
// let renderer = new WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = PCFSoftShadowMap;
// document.body.appendChild(renderer.domElement);

// // based on main scene camera
// const controls = new OrbitControls(camera, renderer.domElement);


// // ***********************************
// // Begin custom geometry
// let pb = new ProtoByte_0000(new Vector3(80, 325, 80));
// scene.add(pb);


// const ambientTexturesLight = new AmbientLight(0xFFFFFF, 1);
// scene.add(ambientTexturesLight);

// const col2 = 0xffffff;
// const intensity = 1;
// const light = new DirectionalLight(col2, intensity);
// light.position.set(15.2, -10.2, 30);
// light.castShadow = true;
// scene.add(light);

// const spot = new SpotLight(0xffffff, 1);
// spot.position.set(-2, 8, 5);
// spot.castShadow = true;
// spot.shadow.radius = 8; //doesn't work with PCFsoftshadows
// spot.shadow.bias = -0.0001;
// spot.shadow.mapSize.width = 1024 * 4;
// spot.shadow.mapSize.height = 1024 * 4;
// scene.add(spot);

// const pointLt = new PointLight(0xff0000, 1, 200); light.position.set(0, 50, 0); scene.add(pointLt);

// function animate() {
//     requestAnimationFrame(animate);
//     controls.update();
//     controls.autoRotate = true;
//     render();
// }

// function render() {
//     renderer.render(scene, camera);
// }
// animate();

// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX

// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX


import { AmbientLight, Bone, BufferGeometry, CatmullRomCurve3, Color, DirectionalLight, MeshPhongMaterial, Float32BufferAttribute, LineSegments, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, Skeleton, SkeletonHelper, SkinnedMesh, SphereGeometry, SpotLight, Uint16BufferAttribute, Vector3, WebGLRenderer, Box3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GeometryDetail } from '../../PByte3/IJGUtils';
import { ProtoByte_0000 } from './Protobyte_0000';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.x = 600;
camera.position.y = 400;
camera.position.z = 500;

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
let pb = new ProtoByte_0000(new Vector3(80, 300, 80));
//scene.add(pb);


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

// make skinned mesh
const skinMesh = makeSkinned(pb.spineMesh);
scene.add(skinMesh);
//make a skeleton helper for tourbleshooting
const skelHelper = new SkeletonHelper(skinMesh);
scene.add(skelHelper);

function makeSkinned(m: THREE.Mesh): SkinnedMesh {
    //console.log('passed m - ', m);
    let nBones: number = pb.boneCount;
    // console.log("pb.boneCount = ", pb.boneCount);
    // console.log("pb.pathVecs.length = ", pb.pathVecs.length);
    // console.log("m.geometry.attributes.position.count = ", m.geometry.attributes.position.count);

    var box = new Box3().setFromObject(pb.spineMesh);
    let meshDim = new Vector3();
    meshDim.subVectors(box.max, box.min);
    // console.log("meshDim  ,", meshDim);

    let bones = [];
    let position = m.geometry.attributes.position;
    //let boneMod = Math.floor(position.count / nBones);
    let seg = pb.curveLenth / pb.boneCount;
    let prevBone = new Bone();
    bones.push(prevBone);
    prevBone.position.y = -pb.curveLenth / 2;
    for (let i = 0; i < pb.boneCount; i++) {
        const bone = new Bone();
        bone.position.y = seg;
        bones.push(bone);
        prevBone.add(bone);
        prevBone = bone;
    }

    //  create indices and weights
    const vertex = new Vector3();
    // get buffergeometry

    let skinIndices = [];
    let skinWeights = [];
    let weightMod = Math.floor(position.count / pb.boneCount);

    // console.log("weightMod = ", weightMod);
    for (let i = 0, j = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);
        const y = vertex.y + pb.curveLenth / 2;
        let skinIndex = Math.floor(y / seg);
        let skinWeight = (y % seg) / seg;

        skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
        skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
    }
    m.geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
    m.geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
    let mat2 = new MeshPhongMaterial();
    let skin = new SkinnedMesh(m.geometry, m.material);
    let skeleton = new Skeleton(bones);
    let rootBone = skeleton.bones[0];
    skin.add(rootBone);
    // bind the skeleton to the mesh
    skin.bind(skeleton);
    skin.geometry.attributes.position.needsUpdate = true;
    return (skin);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    controls.autoRotate = true;

    const time = Date.now() * 0.007;
    skinMesh.skeleton.bones[2].rotation.y = Math.cos(time) * 5 / skinMesh.skeleton.bones.length;
    skinMesh.skeleton.bones[3].rotation.z = Math.sin(time) * 8 / skinMesh.skeleton.bones.length;
    skinMesh.skeleton.bones[1].rotation.x = Math.sin(time) * 2 / skinMesh.skeleton.bones.length;
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();



