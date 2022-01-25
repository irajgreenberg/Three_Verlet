#ifdef GL_ES                // do it if GL_ES is defined (context present)}
precision mediump float;    // ets precision for floats (speed vs qual)
# endif

#define PI 3.14159265359

varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

//uniform sampler2D tex0;
//uniform sampler2d tex1;
//uniform sampler2d fft;
//uniform vec4 unPar;
//uniform vec4 unPos;

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+10.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
// end open siplex noise 

// a rotational matrix used to rotte each octave of 
// noise in the fbm algo
mat2 m = mat2(0.8, 0.6, -0.6, 0.8);

float fbm( vec2 p) { //fractional brownian motion
  float f = 0.0;
  f += 0.5000 * snoise(p); p *= m * 2.02;
  f += 0.2500 * snoise(p); p *= m * 2.03;
  f += 0.1250 * snoise(p); p *= m * 2.01;
  f += 0.0625 * snoise(p); p *= m * 2.04;
  f /= 0.9375;
  return f;
}

void main() {
  // order matters

  // create context of window
  vec2 q = gl_FragCoord.xy/u_resolution.xy;
  // move origin to center  
  vec2 p = -1.0 + 2.0 * q;
  // adjust for window not square
  p.x *= u_resolution.x/u_resolution.y;
  // change left half of background to black
  float background = 1.0;//smoothstep (-0.25, 0.25, p.x);
  // move sphere to right of screen (actually moce matrix left)
  //p.x -= 0.75;
  // get some noise - multiply to scale
  // float f = snoise(16.0 * p);
  // get fbm
  //float f = fbm( 4.0 * p);

  // a mathematical sphere in center of space
  float r = sqrt(dot(p, p));
  float a = atan(p.y, p.x);

  // map the noise or fbm to a gry color
  //vec3 col = vec3(f, f, f);
  vec3 col = vec3(1.0, 1.0, 1.0);

  //pulsing animation
  float ss = 0.5 + 0.5*sin(1.0 * u_time);
  float anim = 1.0 + 0.1*ss*clamp(1.0-r, 0.0, 1.0);
  r *= anim;

  // turn fragments inside the spheres radius to a color
  if (r < 0.8) {  // if part of eyeball
    // a nice blue-green
    col = vec3(0.0, 0.3, 0.4);
    // use fbm to mix it with something greener
    float f = fbm( 5.0 * p);
    col = mix(col, vec3(0.2, 0.5, 0.4), f);
    // add yellow corona around pupil using smoothstep ramp and radius
    f = 1.0 - smoothstep(0.2, 0.5, r);
    col = mix( col, vec3(0.9, 0.6, 0.2), f);
    // distort angles with fbm
    a += 0.05 * fbm( 18.0 * p);
    // white fibers with fbm and polar coords
    f = smoothstep(0.25, 1.0, fbm(vec2(6.0 * r, 20.0 * a)));
    col = mix( col, vec3(1.0), f);
    // add more detail by with black streaks and sametechnique as white
    f = smoothstep(0.4, 0.9, fbm(vec2(10.0 * r, 15.0 * a)));
    col *= 1.0 - 0.5*f;
    // add black around outer edges
    f = smoothstep(0.7, 0.8, r);
    col *= 1.0 - 0.5 * f;
    // draw pupil with ramp radius technique
    f = smoothstep(0.2, 0.25, r);
    col *= f;
    // reflection - need length function 
    f = 1.0 - smoothstep( 0.0, 0.5, length (p-vec2(0.24, 0.2)));
    col += vec3(1.0, 0.9, 0.8)*f*0.9;
    // white around edge to clean up aliasing
    f = smoothstep(0.75, 0.8, r);
    col = mix(col, vec3(1.0), f);
  }

  // map the grey to the current fragment and incorporate bg from above
  gl_FragColor = vec4(col * background, 1.0);
}