// Add real time texturing to Three

// Code appropriated from:
// https://threejsfundamentals.org/threejs/lessons/threejs-canvas-textures.html

import { AmbientLight, BoxGeometry, CanvasTexture, ClampToEdgeWrapping, Color, DirectionalLight, LoadingManager, Mesh, MeshBasicMaterial, MeshPhongMaterial, MirroredRepeatWrapping, PCFSoftShadowMap, PerspectiveCamera, RepeatWrapping, Scene, SphereGeometry, SpotLight, Vector2, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { PBMath } from '../../PByte3/IJGUtils';
import { Particle } from './Particle'

// Get 2D canvas context. By default this type is null.
const ctx = document.createElement('canvas').getContext('2d');

let texture: CanvasTexture;
let cube: Mesh;
let sphere: Mesh;

const PART_COUNT = 200;
const rad: number[] = [];
let pos: Vector3[] = [];
let spd: Vector3[] = [];
const col: Color[] = [];
const grav: number[] = [];
const GRAVITY = .03;

const geomDim = new Vector2(150, 150);
for (let i = 0; i < PART_COUNT; i++) {
    rad[i] = PBMath.rand(.02, 2);
    col[i] = new Color(Math.random() * 0xffffff);
    spd[i] = new Vector3(PBMath.rand(-1.09, 1.09), PBMath.rand(-.07, .07), 0);
    pos[i] = new Vector3(geomDim.x / 2, geomDim.y / 2, 0);
    grav[i] = PBMath.rand(-.003, .003);
}


// ensure ctx is not null throughout code
if (ctx) {
    ctx.canvas.width = geomDim.x;
    ctx.canvas.height = geomDim.y;
    //ctx.fillStyle = '0xBB55F';
    //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    texture = new CanvasTexture(ctx.canvas);
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    // texture.repeat.x = 1;
    // texture.repeat.y = 1;
    // ctx.fill();
}

// requires 1 arg, with 2nd max optional
function randInt(min: number, max?: number) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return Math.random() * (max - min) + min | 0;
}

function drawRandomDot() {
    if (ctx) {
        // clear shape background for animation
        // or don't for painting
        ctx.globalAlpha = 0.1
        ctx.fillStyle = '0xBB55FF';
        ctx.fillRect(0, 0, 150, 150);
        ctx.fill();

        // draw particles
        ctx.globalAlpha = 1
        for (let i = 0; i < PART_COUNT; i++) {
            ctx.fillStyle = col[i].getStyle();
            ctx.beginPath();
            ctx.arc(pos[i].x, pos[i].y, rad[i], 0, Math.PI * 2);
            pos[i].x += spd[i].x;
            spd[i].y += grav[i];
            pos[i].y += spd[i].y;
            ctx.fill();

            if (pos[i].x > geomDim.x - rad[i]) {
                pos[i].x = geomDim.x - rad[i];
                spd[i].x *= -1;
            } else if (pos[i].x < rad[i]) {
                pos[i].x = rad[i];
                spd[i].x *= -1;
            }

            if (pos[i].y > geomDim.y - rad[i]) {
                pos[i].y = geomDim.y - rad[i];
                spd[i].y *= -1;
            } else if (pos[i].y < rad[i]) {
                pos[i].y = rad[i];
                spd[i].y *= -1;
            }

            ctx.strokeStyle = 'orange';
            ctx.lineWidth = .1
            for (let j = 0; j < PART_COUNT; j++) {
                if (i !== j) {
                    let x = pos[i].x - pos[j].x
                    let y = pos[i].y - pos[j].y
                    if (Math.sqrt(x * x + y * y) < 15) {
                        ctx.beginPath();       // Start a new path
                        ctx.moveTo(pos[i].x, pos[i].y);    // Move the pen to (30, 50)
                        ctx.lineTo(pos[j].x, pos[j].y);  // Draw a line to (150, 100)
                        ctx.stroke();
                    }
                }

            }
        }



    }
}

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 7;

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

const ambientTexturesLight = new AmbientLight(0xFFFFFF, .35);
scene.add(ambientTexturesLight);

const col2 = 0xFFAAFF;
const intensity = 1;
const light = new DirectionalLight(col2, intensity);
light.position.set(15.2, 10.2, 12);
light.castShadow = true;
scene.add(light);
3
const spot = new SpotLight(0xEEEEFF, .6);
spot.position.set(-10, 8, 12);
spot.castShadow = true;
spot.shadow.radius = 8; //doesn't work with PCFsoftshadows
spot.shadow.bias = -0.0001;
spot.shadow.mapSize.width = 1024 * 4;
spot.shadow.mapSize.height = 1024 * 4;
scene.add(spot);


// add test Cube
if (ctx) {
    const boxGeom = new BoxGeometry(3, 3, 3);
    // we know texture is not undefined here, so force TS compiler to accept it using !, the non-null operator
    const boxMat = new MeshPhongMaterial({ map: texture!, color: 0xBB55FF });

    cube = new Mesh(boxGeom, boxMat);
    // cube.position.x -= 3;
    // cube.position.y += 2;
    scene.add(cube);


    const sphereGeom = new SphereGeometry(2, 12, 12);
    // we know texture is not undefined here, so force TS compiler to accept it using !, the non-null operator
    // texture!.wrapS = texture!.wrapT = ClampToEdgeWrapping;
    // texture!.repeat.set( 125, 125 );
    // texture!.offset.set( 15, 15 );
    const sphereMat = new MeshPhongMaterial({ map: texture!, color: 0xBB55FF });

    sphere = new Mesh(sphereGeom, sphereMat);
    sphere.position.x += 3;
    sphere.position.y += 2;
    // scene.add(sphere);




    // add fish
    //const loader = new GLTFLoader();

    let globalObject;

    /////////////////////////////////////////
    //manager
    var manager = new LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    //model
    // const loader = new GLTFLoader();
    // loader.load('fishes/scene.gltf', function (object) {
    //     //store global reference to .obj
    //     let globalObject = object;

    //     object.traverse(function (child) {
    //         if (child instanceof Mesh) {
    //             child.material.map = ImageUtils.loadTexture('textures/grid.jpg');
    //             child.material.needsUpdate = true;
    //         }
    //     });

    //     object.position.y = - 80;
    //     scene.add(object);
    // });

    /////////////////////////////////////////

    // loader.load('../gtf/Box.gltf', function(gltf) {
    // //    let model = gltf.scene;
    //     texture.flipY = false; // for glTF models only
    //     gltf.material.map = texture; // <-- move here
    //     scene.add(model);
    //  });

    // Load a glTF resource
    // loader.load(
    //     // resource URL
    //     'fishes/scene.gltf',
    //     // called when the resource is loaded
    //     function (gltf) {

    //         scene.add(gltf.scene);

    //         gltf.animations; // Array<THREE.AnimationClip>
    //         gltf.scene; // THREE.Group
    //         gltf.scenes; // Array<THREE.Group>
    //         gltf.cameras; // Array<THREE.Camera>
    //         gltf.asset; // Object

    //     },
    //     // called while loading is progressing
    //     function (xhr) {

    //         console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    //     },
    //     // called when loading has errors
    //     function (error) {

    //         console.log('An error happened');

    //     }
    // );
}


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    cube.rotateX(Math.PI / 540);
    cube.rotateY(Math.PI / 720);

    sphere.rotateX(-Math.PI / 540);
    sphere.rotateZ(Math.PI / 720);

    drawRandomDot();

    // required to see texture changes each animation frame
    texture.needsUpdate = true;
    render();
}

function render() {
    renderer.render(scene, camera);
}
animate();