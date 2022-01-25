// Protobyte_0008
// Ira Greenberg
// David G. Smith
// Bacon Bits Cooperative
// Dallas, TX

// Project Description:
import {
  OrthographicCamera,
  Vector4,
  MeshDepthMaterial,
  ShaderMaterial,
  LinearFilter,
  WebGLRenderTarget,
  RGBFormat,
  UniformsUtils,
} from "three";
import { Mesh, PlaneGeometry } from "three";
import {
  GodRaysFakeSunShader,
  GodRaysDepthMaskShader,
  GodRaysCombineShader,
  GodRaysGenerateShader,
} from "three/examples/jsm/shaders/GodRaysShader.js";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  FogExp2,
  Group,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  SpotLight,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { cos, PI, sin } from "../../../PByte3/IJGUtils";
import { Protobyte_0008 } from "./Protobyte_0008";
let timeStart: any;
let timeDelta: any;
let time: any;
let pb: any;
let materialDepth: any; //
let sunPosition = new Vector3( 350, 750, - 700 );//(300, 800, -1200); //
const clipPosition = new Vector4();
const screenSpacePosition = new Vector3();
const postprocessing: any = { enabled: true };
const bgColor = 0x000511;
const sunColor = 0x998800;//0xffee00;
const godrayRenderTargetResolutionMultiplier = 1.0 / 4.0;

const rainbowNoiseShader = {
  uniforms: {
    u_resolution: {
      value: null,
    },

    u_time: {
      value: 1.0,
    },

    noiseFilter: {
      value: 0.3,
    },
  },

  vertexShader: /* glsl */ `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix *
                  modelViewMatrix *
                  vec4(position,1.0);
  }`,

  fragmentShader: /* glsl */ `//  0,0 is in the lower left corner, 1,1 in the upper right

  #ifdef GL_ES                // do it if GL_ES is defined (context present)}
  precision mediump float;    // ets precision for floats (speed vs qual)
  # endif
  
  #define PI 3.14159265359
  
  varying vec2 vUv;
  
  uniform vec2 u_resolution;   // the resolution of the window passed in from js
  //uniform vec2 u_mouse;       // the mouse posit passed in from js
  uniform float u_time;     // time passed in from js
  uniform float noiseFilter;

  // open simplex noise included here for use in my code below it
  // Copyright (C) 2011 by Ashima Arts (Simplex noise)
  // Copyright (C) 2011-2016 by Stefan Gustavson (Classic noise and others)
  // https://github.com/ashima/webgl-noise/blob/master/LICENSE
  // Description : Array and textureless GLSL 2D/3D/4D simplex 
  //               noise functions.
  //      Author : Ian McEwan, Ashima Arts.
  //  Maintainer : stegu
  //     Lastmod : 20201014 (stegu)
  //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
  //               Distributed under the MIT License. See LICENSE file.
  //               https://github.com/ashima/webgl-noise
  //               https://github.com/stegu/webgl-noise
  // 
  
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
       return mod289(((x*34.0)+10.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise(vec3 v)
    { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  
  // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
  
  // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
  
    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
    //   x1 = x0 - i1  + 1.0 * C.xxx;
    //   x2 = x0 - i2  + 2.0 * C.xxx;
    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  
  // Permutations
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  
  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;
  
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
  
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
  
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
  
    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
  
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
  
  //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
  
  // Mix final noise value
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
    }
  // end open siplex noise 
  
  vec4 plotNoise() { 
    // my code using webgl open simplex noise (below)
  //  vec2 st = gl_FragCoord.xy/u_resolution; //vUv; // normalize pixel coord
    vec2 st = vUv * 2.0 - 1.0;
  
    float r = snoise(vec3(st,u_time/10.0));//u_time/10.0));
    float g = snoise(vec3(st,u_time/5.0));// u_time/5.0));
    float b = snoise(vec3(st,u_time/7.0));// u_time/7.0));
    return vec4(r, g, b, 0.85);
  // return vec4(snoise(vec3(st.x, st.y, u_time)));
  }
  
  #define numOctaves 4
  float fbm( vec2 x, float H )
  {    
      float G = exp2(-H);
      float f = 1.0;
      float a = 1.0;
      float t = 0.0;
      for( int i=0; i<numOctaves; i++ )
      {
          t += a*snoise(vec3(f*x,1.0));
          f *= 2.0;
          a *= G;
      }
      return t;
  }
  vec4 plotNoise2(vec2 st) { 
    // my code using webgl open simplex noise (below)
    //vec2 st = gl_FragCoord.xy/u_resolution; //vUv; // normalize pixel coord
//    vec2 st = vUv * 2.0 - 1.0;
  
    float r = snoise(vec3(st,1.0))*sin(u_time)*0.8902;//u_time/10.0));
    float g = snoise(vec3(st,1.0))*cos(u_time)*0.1922;// u_time/5.0));
    float b = snoise(vec3(st,1.0))*-sin(u_time)*0.7255;// u_time/7.0));
    return vec4(r, g, b, 0.75);
  //  return vec4(snoise(vec3(st.x, st.y, u_time)));
  }
  void main () {
    vec2 st = vUv;// * 2.0 - 1.0;
    vec4 col2 = vec4(0.8902, 0.1922, 0.7255,1.0);

    // bottom-left
    vec2 bl = smoothstep(vec2(0.0), vec2(0.025), st);
    float pct = bl.x * bl.y;

    // top-right
    vec2 tr = smoothstep(vec2(0.0), vec2(0.025),1.0-st);
    pct *= tr.x * tr.y;
    col2 = vec4(pct,pct,pct,0.75);

    vec4 col = plotNoise2(st) + vec4(0.8431, 0.4667, 0.0706, 1.0) * 0.5;
    col += fbm(st+fbm(st, (sin(u_time*0.3))), u_time*0.1);
    col = col * col2;
    gl_FragColor = col;
   }`,
};

// create and position camera
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  10000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 400;

const scene = new Scene();
scene.background = new Color(0x332233);
//scene.fog = new Fog(scene.background, 0.0028, 1200);
//scene.fog = new FogExp2(0x332233, 0.0018);

timeStart = new Date().getTime();
materialDepth = new MeshDepthMaterial(); //
//  const materialScene = new MeshBasicMaterial( { color: 0x000000 } );//
const materialScene = new ShaderMaterial({
  uniforms: rainbowNoiseShader.uniforms,
  vertexShader: rainbowNoiseShader.vertexShader,
  fragmentShader: rainbowNoiseShader.fragmentShader,
});

// main renderer
let renderer = new WebGLRenderer({ antialias: true });
renderer.setClearColor(0x1d1d1d);
renderer.setSize(window.innerWidth, window.innerHeight, true);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.autoClear = false;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

//****************** Custom geometry ******************//
pb = new Protobyte_0008(new Vector3(30, 300, 30));
let pbGroup = new Group();
pbGroup.add(pb);
//pb.translateX(250);
pb.rotateZ(PI / 2);
scene.add(pbGroup);
//pb.rotateX(PI / 2)
console.log(pb);
pb.children[0].material = materialScene;
//*****************************************************//
window.addEventListener("resize", onWindowResize);
initPostprocessing(window.innerWidth, window.innerHeight); //

function onWindowResize() {
  const renderTargetWidth = window.innerWidth;
  const renderTargetHeight = window.innerHeight;

  camera.aspect = renderTargetWidth / renderTargetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(renderTargetWidth, renderTargetHeight);
  postprocessing.rtTextureColors.setSize(renderTargetWidth, renderTargetHeight);
  postprocessing.rtTextureDepth.setSize(renderTargetWidth, renderTargetHeight);
  postprocessing.rtTextureDepthMask.setSize(
    renderTargetWidth,
    renderTargetHeight
  );

  const adjustedWidth =
    renderTargetWidth * godrayRenderTargetResolutionMultiplier;
  const adjustedHeight =
    renderTargetHeight * godrayRenderTargetResolutionMultiplier;
  postprocessing.rtTextureGodRays1.setSize(adjustedWidth, adjustedHeight);
  postprocessing.rtTextureGodRays2.setSize(adjustedWidth, adjustedHeight);
}

function initPostprocessing(renderTargetWidth: any, renderTargetHeight: any) {
  postprocessing.scene = new Scene();

  postprocessing.camera = new OrthographicCamera(
    -0.5,
    0.5,
    0.5,
    -0.5,
    -10000,
    10000
  );
  postprocessing.camera.position.z = 100;

  postprocessing.scene.add(postprocessing.camera);

  const pars = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBFormat,
  };
  postprocessing.rtTextureColors = new WebGLRenderTarget(
    renderTargetWidth,
    renderTargetHeight,
    pars
  );

  // Switching the depth formats to luminance from rgb doesn't seem to work. I didn't
  // investigate further for now.
  // pars.format = LuminanceFormat;

  // I would have this quarter size and use it as one of the ping-pong render
  // targets but the aliasing causes some temporal flickering

  postprocessing.rtTextureDepth = new WebGLRenderTarget(
    renderTargetWidth,
    renderTargetHeight,
    pars
  );
  postprocessing.rtTextureDepthMask = new WebGLRenderTarget(
    renderTargetWidth,
    renderTargetHeight,
    pars
  );

  // The ping-pong render targets can use an adjusted resolution to minimize cost

  const adjustedWidth =
    renderTargetWidth * godrayRenderTargetResolutionMultiplier;
  const adjustedHeight =
    renderTargetHeight * godrayRenderTargetResolutionMultiplier;
  postprocessing.rtTextureGodRays1 = new WebGLRenderTarget(
    adjustedWidth,
    adjustedHeight,
    pars
  );
  postprocessing.rtTextureGodRays2 = new WebGLRenderTarget(
    adjustedWidth,
    adjustedHeight,
    pars
  );

  // god-ray shaders

  const godraysMaskShader = GodRaysDepthMaskShader;
  postprocessing.godrayMaskUniforms = UniformsUtils.clone(
    godraysMaskShader.uniforms
  );
  postprocessing.materialGodraysDepthMask = new ShaderMaterial({
    uniforms: postprocessing.godrayMaskUniforms,
    vertexShader: godraysMaskShader.vertexShader,
    fragmentShader: godraysMaskShader.fragmentShader,
    // vertexShader: rainbowNoiseShader.vertexShader,
    // fragmentShader: rainbowNoiseShader.fragmentShader
  });

  const godraysGenShader = GodRaysGenerateShader;
  postprocessing.godrayGenUniforms = UniformsUtils.clone(
    godraysGenShader.uniforms
  );
  postprocessing.materialGodraysGenerate = new ShaderMaterial({
    uniforms: postprocessing.godrayGenUniforms,
    vertexShader: godraysGenShader.vertexShader,
    fragmentShader: godraysGenShader.fragmentShader,
    // vertexShader: rainbowNoiseShader.vertexShader,
    // fragmentShader: rainbowNoiseShader.fragmentShader
  });

  const godraysCombineShader = GodRaysCombineShader;
  postprocessing.godrayCombineUniforms = UniformsUtils.clone(
    godraysCombineShader.uniforms
  );
  postprocessing.materialGodraysCombine = new ShaderMaterial({
    uniforms: postprocessing.godrayCombineUniforms,
    vertexShader: godraysCombineShader.vertexShader,
    fragmentShader: godraysCombineShader.fragmentShader,
    // vertexShader: rainbowNoiseShader.vertexShader,
    // fragmentShader: rainbowNoiseShader.fragmentShader
  });

  const godraysFakeSunShader = GodRaysFakeSunShader;
  postprocessing.godraysFakeSunUniforms = UniformsUtils.clone(
    godraysFakeSunShader.uniforms
  );
  postprocessing.materialGodraysFakeSun = new ShaderMaterial({
    uniforms: postprocessing.godraysFakeSunUniforms,
    vertexShader: godraysFakeSunShader.vertexShader,
    fragmentShader: godraysFakeSunShader.fragmentShader,
    // vertexShader: rainbowNoiseShader.vertexShader,
    // fragmentShader: rainbowNoiseShader.fragmentShader
  });

  postprocessing.godraysFakeSunUniforms.bgColor.value.setHex(bgColor);
  postprocessing.godraysFakeSunUniforms.sunColor.value.setHex(sunColor);

  postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.9;

  postprocessing.quad = new Mesh(
    new PlaneGeometry(1.0, 1.0),
    postprocessing.materialGodraysGenerate
  );
  postprocessing.quad.position.z = -9900;
  postprocessing.scene.add(postprocessing.quad);
}

const ambientTexturesLight = new AmbientLight(0xffffff, 0.7);
scene.add(ambientTexturesLight);

const col2 = 0x554444;//0xffeeee;
const intensity = 0.45;//1.0;
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

const pointLt = new PointLight(0xff0000, 1, 200);
light.position.set(0, 50, 100);
scene.add(pointLt);
//pbGroup.translateX(200);

function animate() {
  requestAnimationFrame(animate);
  render();
}

function getStepSize(filterLen: any, tapsPerPass: any, pass: any) {
  return filterLen * Math.pow(tapsPerPass, -pass);
}

function filterGodRays(inputTex: any, renderTarget: any, stepSize: any) {
  postprocessing.scene.overrideMaterial =
    postprocessing.materialGodraysGenerate;

  postprocessing.godrayGenUniforms["fStepSize"].value = stepSize;
  postprocessing.godrayGenUniforms["tInput"].value = inputTex;

  renderer.setRenderTarget(renderTarget);
  renderer.render(postprocessing.scene, postprocessing.camera);
  postprocessing.scene.overrideMaterial = null;
}

function updateTime() {
  const newTime = (new Date().getTime() - timeStart) / 1000;
  timeDelta = newTime - time;
  time = newTime;
  // if (animationTime < 1.0) {
  // 	const animationSpeed = 0.8;
  // 	animationTime += timeDelta * animationSpeed;
  // }
}

function render() {
  controls.update();
  // controls.autoRotate = true;
//  const time = Date.now() * 0.3;
  updateTime();
  pb.move(time);
  let z = cos((time * PI) / 2780) * 320;
  let x = sin((time * PI) / 2780) * 320;
  rainbowNoiseShader.uniforms["u_time"].value = time; ///1000;
  materialScene.needsUpdate = true;
  pb.children[0].material.needsUpdate = true;

  pbGroup.position.x = x;
  pbGroup.position.z = z - 100;
  pbGroup.position.y = sin((time * PI) / 2780) * 150 + 45;
  // pbGroup.translateZ(z)
  // pbGroup.translateX(x)
  //pbGroup.trans
  // pbGroup.rotation.x = (time * PI / 720) * .6;
  pb.rotation.y = Math.atan2(x, z);
  //pb.rotation.z = time * PI / 2780

  //pb.rotateZ(Math.atan2(z, x));

  // const time = Date.now() / 4000;
   postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.85; // + Math.sin(time);
  rainbowNoiseShader.uniforms.u_time.value = time * 5.0;
  //  sunPosition = new Vector3(300+(Math.sin(time*1500)*11), 800+(Math.sin(time*2500)*12), -1200+(Math.sin(time*5000)*10));//( 350, 750, - 1000 );
  //  try adding noise to move sun
  if (postprocessing.enabled) {
    clipPosition.x = sunPosition.x;
    clipPosition.y = sunPosition.y;
    clipPosition.z = sunPosition.z;
    clipPosition.w = 1;

    clipPosition
      .applyMatrix4(camera.matrixWorldInverse)
      .applyMatrix4(camera.projectionMatrix);

    // perspective divide (produce NDC space)

    clipPosition.x /= clipPosition.w;
    clipPosition.y /= clipPosition.w;

    screenSpacePosition.x = (clipPosition.x + 1) / 2; // transform from [-1,1] to [0,1]
    screenSpacePosition.y = (clipPosition.y + 1) / 2; // transform from [-1,1] to [0,1]
    screenSpacePosition.z = clipPosition.z; // needs to stay in clip space for visibilty checks

    // Give it to the god-ray and sun shaders

    postprocessing.godrayGenUniforms["vSunPositionScreenSpace"].value.copy(
      screenSpacePosition
    );
    postprocessing.godraysFakeSunUniforms["vSunPositionScreenSpace"].value.copy(
      screenSpacePosition
    );

    // -- Draw sky and sun --

    // Clear colors and depths, will clear to sky color

    renderer.setRenderTarget(postprocessing.rtTextureColors);
    renderer.clear(true, true, false);

    // Sun render. Runs a shader that gives a brightness based on the screen
    // space distance to the sun. Not very efficient, so i make a scissor
    // rectangle around the suns position to avoid rendering surrounding pixels.

    const sunsqH = 0.74 * window.innerHeight; // 0.74 depends on extent of sun from shader
    const sunsqW = 0.74 * window.innerHeight; // both depend on height because sun is aspect-corrected

    screenSpacePosition.x *= window.innerWidth;
    screenSpacePosition.y *= window.innerHeight;

    renderer.setScissor(
      screenSpacePosition.x - sunsqW / 2,
      screenSpacePosition.y - sunsqH / 2,
      sunsqW,
      sunsqH
    );
    renderer.setScissorTest(true);

    postprocessing.godraysFakeSunUniforms["fAspect"].value =
      window.innerWidth / window.innerHeight;

    postprocessing.scene.overrideMaterial =
      postprocessing.materialGodraysFakeSun;
    renderer.setRenderTarget(postprocessing.rtTextureColors);
    renderer.render(postprocessing.scene, postprocessing.camera);

    renderer.setScissorTest(false);

    // -- Draw scene objects --

    // Colors

    scene.overrideMaterial = null;
    renderer.setRenderTarget(postprocessing.rtTextureColors);
    renderer.render(scene, camera);

    // Depth

    scene.overrideMaterial = materialDepth;
    renderer.setRenderTarget(postprocessing.rtTextureDepth);
    renderer.clear();
    renderer.render(scene, camera);

    //

    postprocessing.godrayMaskUniforms["tInput"].value =
      postprocessing.rtTextureDepth.texture;

    postprocessing.scene.overrideMaterial =
      postprocessing.materialGodraysDepthMask;
    renderer.setRenderTarget(postprocessing.rtTextureDepthMask);
    renderer.render(postprocessing.scene, postprocessing.camera);

    // -- Render god-rays --
    // Maximum length of god-rays (in texture space [0,1]X[0,1])
    const filterLen = 1.0;

    // Samples taken by filter

    const TAPS_PER_PASS = 6.0;

    // Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
    // would start with a small filter support and grow to large. however
    // the large-to-small order produces less objectionable aliasing artifacts that
    // appear as a glimmer along the length of the beams

    // pass 1 - render into first ping-pong target
    filterGodRays(
      postprocessing.rtTextureDepthMask.texture,
      postprocessing.rtTextureGodRays2,
      getStepSize(filterLen, TAPS_PER_PASS, 1.0)
    );

    // pass 2 - render into second ping-pong target
    filterGodRays(
      postprocessing.rtTextureGodRays2.texture,
      postprocessing.rtTextureGodRays1,
      getStepSize(filterLen, TAPS_PER_PASS, 2.0)
    );

    // pass 3 - 1st RT
    filterGodRays(
      postprocessing.rtTextureGodRays1.texture,
      postprocessing.rtTextureGodRays2,
      getStepSize(filterLen, TAPS_PER_PASS, 3.0)
    );

    // final pass - composite god-rays onto colors

    postprocessing.godrayCombineUniforms["tColors"].value =
      postprocessing.rtTextureColors.texture;
    postprocessing.godrayCombineUniforms["tGodRays"].value =
      postprocessing.rtTextureGodRays2.texture;

    postprocessing.scene.overrideMaterial =
      postprocessing.materialGodraysCombine;

    renderer.setRenderTarget(null);
    renderer.render(postprocessing.scene, postprocessing.camera);
    postprocessing.scene.overrideMaterial = null;
  } else {
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);
  }
}
animate();
