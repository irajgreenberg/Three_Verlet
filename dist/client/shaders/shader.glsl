//  0,0 is in the lower left corner, 1,1 in the upper right

#ifdef GL_ES                // do it if GL_ES is defined (context present)}
precision mediump float;    // ets precision for floats (speed vs qual)
# endif

#define PI 3.14159265359

uniform vec2 u_resolution;   // the resolution of the window passed in from js
uniform vec2 u_mouse;       // the mouse posit passed in from js
uniform float u_time;     // time passed in from js
/////////////////////////////////////////////////////////
vec4 plotStraight() { // Book of
  vec2 st = gl_FragCoord.xy/u_resolution;
  float y = st.x;
  vec3 color = vec3(y);
  // Plot a line
  float pct = smoothstep(0.02, 0.0, abs(st.y - st.x));
  color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);
  return vec4(color,1.0);
}
///////////////////////////////////////////////////////////
vec4 plotFunct () { // Book of Shaders
  vec2 st = gl_FragCoord.xy/u_resolution;
  float y = pow(st.x,5.0);
  vec3 color = vec3(y);
  float pct = smoothstep( y-0.02, y, st.y) -
          smoothstep( y, y+0.02, st.y);
  color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);
  return vec4(color,1.0);
}
//////////////////////////////////////////////////////////
vec4 plotCircle() { // me
  vec2 st = gl_FragCoord.xy/u_resolution;  // normalize pixel coord
  float cx = 0.5 + (-cos(u_time)*0.35);//0.7;
  float cy = 0.5 + (sin(u_time)*0.35);//0.3;
  float rad = 0.1;
  vec2 ctr = vec2(cx, cy);
  float bgc = (st.x-st.y)/2.0;
  //vec3 colorGBA = vec3(bgc, bgc, 1.0);
  float pct = distance(st, ctr);
  bool red = pct < rad;
  vec3 colorGBA = vec3(float(!red) * bgc, float(!red)*bgc, 1.0);
  return vec4(red, colorGBA);
}
//////////////////////////
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
  vec2 st = gl_FragCoord.xy/u_resolution;  // normalize pixel coord
  float r = st.x + snoise(vec3(st, u_time/5.0));
  float g = st.x + snoise(vec3(st, u_time/3.0));
  float b = st.x + snoise(vec3(st, u_time/1.0));
  return vec4(r, g, b, 1.0);
}
//////////////////////////////////////////////////////////
 
vec4 plotRadiusRange() {
  vec2 st = gl_FragCoord.xy/u_resolution;  // normalize pixel coord
  float cx = 0.5;
  float cy = 0.5;
  vec2 cp = vec2(cx, cy);
  bool rb = (distance(cp, st) < 0.1) && (distance(cp, st) > 0.095);
  float r = float(rb);
  float g = 0.5;//st.x + snoise(vec3(st, u_time/3.0));
  float b = 0.5;//st.x + snoise(vec3(st, u_time/1.0));
  return vec4(r, g, b, 1.0);
}

//////////////////////////////////////////////////////////

vec4 plotAngleLine() {//-PI to PI
  vec2 st = gl_FragCoord.xy/u_resolution;  // normalize pixel coord
  float ang = 2.0;  //-PI to PI
  bool rb = (atan(st.y-0.5, st.x-0.5) >= ang) && (atan(st.y-0.5, st.x-0.5) <= ang+0.01);// || (atan(st.y-0.5, st.x-0.5) >= ang);
  float r = float(rb);
  float g = 0.5;
  float b = 0.5;
  return vec4(r, g, b, 1.0);
 
}

//////////////////////////////////////////////////////////
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

vec4 plotFibonacciFlower() {
  vec2 st = gl_FragCoord.xy/u_resolution;  // normalize pixel coord
    // move space from the center to the vec2(0.0)
    st -= vec2(0.5);
    // rotate the space
    st = rotate2d( sin(u_time/15.0)*PI ) * st;
    // move it back to the original place
    st += vec2(0.5);

  float cx = 0.5;
  float cy = 0.5;
  vec2 cp = vec2(cx, cy);
  bool onRadius = ((fract(distance(cp, st)/0.08) <= 0.3) );
  bool onOffsetRadius = ((fract(distance(cp, st)/0.04) <= 0.6)  &&
                         !onRadius);
  bool onAngle = (fract(atan(st.y-0.5, st.x-0.5)/0.19638444) <= 0.4);
  bool onOffsetAngle = (fract(atan(st.y-0.5, st.x-0.5)/0.09819222) <= 0.8) && 
                 !onAngle;

  bool live = ((onRadius && onAngle) || (onOffsetRadius && onOffsetAngle));

  float r = abs(sin(u_time / 3.0));
  float g = abs(cos(u_time / 5.0));
  float b = abs(atan(u_time) * 2.0);

float fade = 1.0-distance(vec2(st.x + 0.15, st.y + 0.2), vec2((fract(distance(cp, st)/0.04)), (fract(atan(st.y-0.5, st.x-0.5)/0.09819222))));
  return vec4(r, g, b, float(live) * fade);
}

//////////////////////////////////////////////////////////
void main () {
  
//  gl_FragColor = plotStraight();
//  gl_FragColor = plotFunct();
//  gl_FragColor = plotCircle();
//  gl_FragColor = plotNoise();
//  gl_FragColor = plotRadiusRange();
//  gl_FragColor = plotAngleLine();
gl_FragColor = plotFibonacciFlower();
 }
