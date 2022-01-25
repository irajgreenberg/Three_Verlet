// Constellation, 2022
// Ira Greenberg
// Bacon Bits Cooperative
// Dallas, TX | Santa Fe, NM

// Project Description: 
// Generates randomized ficticious constellations
// Original idea inspired by #Genuary2022 prompt: 'Space'


import { AmbientLight, Color, DirectionalLight, PCFSoftShadowMap, PerspectiveCamera, PointLight, Scene, SpotLight, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Generator } from './Generator';

// create and position camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 900;

const scene = new Scene();
let greyCol = Math.random();
const myColor = new Color(greyCol, greyCol, greyCol);
scene.background = myColor;
document.body.style.backgroundColor = '#' + myColor.getHexString();

// main renderer
let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

/****************** Custom geometry *******************/
let generator: Generator = new Generator();
scene.add(generator);
/******************************************************/

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

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    controls.autoRotate = true;

    const time = Date.now() * 0.007;
    generator.move(time);
    render();

}
let frameCntr = 0;
function render() {
    renderer.render(scene, camera);

    // add timer/boolean control for screen capture
    if (frameCntr++ == 1000) {
        //@ts-expect-error
        window.OneOfX.save(
            {
                "Constellation Count": generator.constellationCount,
                "Global Particle Speed": generator.globalParticleSpeed,
                "Orb Subdivision Factor": generator.orbSubDivision,
                "Orb Color": generator.orbColor,
                "Particle[0] Emission Position Extrema": generator.constellations[0].posExtrema.x,
                "Particle[0] Speed.x Extrema": generator.constellations[0].spdExtrema.x,
                "Particle[0] Speed.y Extrema": generator.constellations[0].spdExtrema.y,
                "Particle[0] Speed.z Extrema": generator.constellations[0].spdExtrema.z,
                "Particle[0] Engagement Proximity": generator.constellations[0].proximity.x,
                "Particle[0] Count": generator.constellations[0].partCount,
                "Particle[0] Conecting Line Count": generator.constellations[0].lineCount,
                "Particle[0] Radius": generator.constellations[0].radius,
                "Particle[0] Body Color": generator.constellations[0].partMat.color,
            }
        );
    }


}
animate();

window.addEventListener("resize", onWindowResize)

function onWindowResize() {
    (camera.aspect = window.innerWidth / window.innerHeight),
        camera.updateProjectionMatrix(),
        renderer.setSize(window.innerWidth, window.innerHeight);
}




