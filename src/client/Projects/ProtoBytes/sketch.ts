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


import { AmbientLight, Bone, BufferGeometry, CatmullRomCurve3, Color, DirectionalLight, Float32BufferAttribute, LineSegments, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, Skeleton, SkeletonHelper, SkinnedMesh, SphereGeometry, SpotLight, Uint16BufferAttribute, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ProtoByte_0000 } from './Protobyte_0000';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 400;

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
let pb = new ProtoByte_0000(new Vector3(80, 325, 80));
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
// make a skeleton helper for tourbleshooting
const skelHelper = new SkeletonHelper(skinMesh);
scene.add(skelHelper);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    controls.autoRotate = true;

    const time = Date.now() * 0.001;
    for (let i = 0; i < skinMesh.skeleton.bones.length; i++) {
        skinMesh.skeleton.bones[i].rotation.x = Math.sin(time) * 2 / skinMesh.skeleton.bones.length;
        skinMesh.skeleton.bones[i].rotation.y = Math.sin(time) * 3 / skinMesh.skeleton.bones.length;
        skinMesh.skeleton.bones[i].rotation.z = Math.sin(time) * 4 / skinMesh.skeleton.bones.length;

        // (skinMesh.geometry as BufferGeometry).attributes.position.needsUpdate = true;
    }



    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();


function makeSkinned(pb: any): SkinnedMesh {
    let nBones = pb.tubeSegs / 10;
    let bones = [];
    // make bones
    for (let i = 0; i < nBones; i++) {
        bones[i] = new Bone();
        if (i == 0) {
            bones[i].position.y = 0;
        } else {
            bones[i].position.y = nBones;
            bones[i - 1].add(bones[i]);
        }
    }
    //  traverses position index assigning a bone index and influence factor to each point
    let position = pb.geometry.attributes.position;
    let segmentHeight = 10;
    let segmentCount = nBones;
    let totalHeight = segmentCount * segmentHeight;
    let vertex = new Vector3();
    let skinIndices = [];
    let skinWeights = [];
    for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);
        let y = (vertex.y);
        let skinIndex = Math.floor(i / position.count);
        let skinWeight = (position.count % segmentCount);
        skinIndices.push(skinIndex, 0, 0, 0);
        skinWeights.push(1 - skinWeight/*might be skinWeight-1 instead*/, 0, 0, 0);
    }
    pb.geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
    pb.geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
    let skin = new SkinnedMesh(pb.geometry, pb.material);
    let skeleton = new Skeleton(bones);
    let rootBone = skeleton.bones[0];
    skin.add(rootBone);
    // bind the skeleton to the mesh
    skin.bind(skeleton);
    return (skin);
}