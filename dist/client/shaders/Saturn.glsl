// Saturn image by David G. Smith - January 2022
//
// Reference photo: https://images.nasa.gov/details-PIA01383
//
#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14159265359
#define MAX_STEPS 100
#define SURFACE_DIST 0.005
#define MAX_DIST 100.0
#define SEED 1.123456789
#define HASHM mat4(40.15384,31.973157,31.179219,10.72341,13.123009,41.441023,-311.61923,10.41234,178.127121,16.34673, 12.94702, 36.97206, 90.58375,76.92655, 13.39964, 17.63895)

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

//Thanks to @The_ArtOfCode for teaching me to rayMarch: 
//https://www.youtube.com/watch?v=PGtv-dBi2wE
//https://www.youtube.com/watch?v=Ff0jJyyiVyw
//https://www.youtube.com/watch?v=AfKGMUDWfuE

varying vec2 vUv;


float hash(vec3 p) { 
  // from https://www.shadertoy.com/view/MtlczH
  // @aft
  // Licensed under MIT.
  
  // An attempt to create a seeded hash  
  // without sine with less artifacts.
  
  // Based on David Hoskins' idea.
  // https://www.shadertoy.com/view/4djSRW
	vec4 p4 = fract(vec4(p.x, p.y, p.z, (p.x + p.y + p.z + SEED * 1e-7)) * HASHM);
    p4 += dot(p4, p4.yzxw + 41.19);
    return fract((p4.x + p4.y + p4.z) * p4.w);
}

float smoothNoise(vec3 uv) {
  // based on https://www.youtube.com/watch?v=zXsWftRdsvU
  vec3 lv = fract(uv);
  lv = lv*lv*(3.0-2.0*lv);
  vec3 id = floor(uv);

  float bl = hash(id+vec3(0.0,0.0,0.0));
  float br = hash(id+vec3(1.0,0.0,0.0));
  float b = mix(bl, br, lv.x);

  float tl = hash(id+vec3(0.0,1.0,0.0));
  float tr = hash(id+vec3(1.0,1.0,0.0));
  float t = mix(tl, tr, lv.x);

  float twoD = mix(b, t, lv.y);

  float bl2 = hash(id+vec3(0.0,0.0,1.0));
  float br2 = hash(id+vec3(1.0,0.0,1.0));
  float b2 = mix(bl2, br2, lv.x);

  float tl2 = hash(id+vec3(0.0,1.0,1.0));
  float tr2 = hash(id+vec3(1.0,1.0,1.0));
  float t2 = mix(tl2, tr2, lv.x);

  float twoD2 = mix(b2, t2, lv.y);

  return mix(twoD, twoD2, lv.z);
}

float noiseAndFBM(vec3 uv) {  // add 4 octaves
  // based on https://www.youtube.com/watch?v=zXsWftRdsvU
  float c = smoothNoise(uv*4.0);
  c += smoothNoise(uv*8.0) * 0.5;
  c += smoothNoise(uv*16.0) * 0.25;
  c += smoothNoise(uv*32.0) * 0.125;
  c += smoothNoise(uv*64.0) * 0.0625;
  c /= 2.0; // divide to keep within 1;
  return c;
}


float sdCappedCylinder( vec3 p, float h, float r ) { //https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(h,r);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

float getDist(vec3 p) {
  // distance to sphere: Length of Vector - radius
  vec4 s = vec4(0.0, 1.0, 6.0, 1.2);
 // p.xy *= Rot(u_time);		// rotation
  float sphereDist = length(p-s.xyz)-s.w;  
  // distance ringds
// vec3 rPosit = p-vec3(0.0, 1.0, 6.0);
// rPosit.xz *= Rot(1.5);
// rPosit.yz *= Rot(.55);
//   float oRDist = sdCappedCylinder(rPosit, 2.3, 0.007);
//   float iRDist = length(p-vec3(0.0, 1.0, 6.0))-1.4;
//   float rings = max(-iRDist, oRDist);
  float d = sphereDist;
//  d = min(d, rings);
  return d;
}
float getDist2(vec3 p) {
  // distance to sphere: Length of Vector - radius
  vec4 s = vec4(0.0, 1.0, 6.0, 1.2);
 // p.xy *= Rot(u_time);		// rotation
  float sphereDist = length(p-s.xyz)-s.w;  
  // distance ringds
vec3 rPosit = p-vec3(0.0, 1.0, 6.0);
rPosit.xz *= Rot(1.67);
rPosit.yz *= Rot(.55);
  float oRDist = sdCappedCylinder(rPosit, 2.4, 0.007);
  float iRDist = length(p-vec3(0.0, 1.0, 6.0))-1.4;
  float rings = max(-iRDist, oRDist);

//float d = rings;
  float d = sphereDist;
  d = min(d, rings);
  return d;
}

float rayMarch(vec3 ro, vec3 rd) {
  float dO = 0.0;
  for (int i =0; i < MAX_STEPS; i++) {
    vec3 p = ro+dO*rd;
    float ds = getDist(p);
    dO += ds;
    if (ds<SURFACE_DIST || dO>MAX_DIST) break;
  }
  return dO;
}
float rayMarch2(vec3 ro, vec3 rd) {
  float dO = 0.0;
  for (int i =0; i < MAX_STEPS; i++) {
    vec3 p = ro+dO*rd;
    float ds = getDist2(p);
    dO += ds;
    if (ds<SURFACE_DIST || dO>MAX_DIST) break;
  }
  return dO;
}

vec3 getNormal(vec3 p) {
  float d = getDist(p);
  vec2 e = vec2(0.01, 0.0);
  vec3 n = d - vec3(  //swizzle of e to find points around for slope
    getDist(p-e.xyy),
    getDist(p-e.yxy),
    getDist(p-e.yyx));
  return normalize(n);
}

float getLight(vec3 p, float intensity) {
  vec3 lightPos = vec3(2.4 , 5.85, 5.75);
//  lightPos.xz += vec2(sin(2.7), cos(1.2)) * 2.8;
  vec3 l = normalize(lightPos - p);
  vec3 n = getNormal(p);
  float dif = clamp(dot(n, l), 0.0, intensity);
  // get shadow
  float d  = rayMarch(p +n*SURFACE_DIST * 2.0, l);
  if (d < length(lightPos - p)) dif *= 0.1;
  return dif;
}

void main() {
  vec2 uv = (gl_FragCoord.xy-(0.5*u_resolution.xy))/u_resolution.y;
  vec3 col = mix(vec3(0.0, 0.0, 0.0), (noiseAndFBM(vec3(uv.x, uv.y, u_time*0.09)) *vec3(0.3216, 0.1922, 0.2627)),0.5);

  vec3 ro = vec3(0.1, 1.7, 2.7);  // camera position (ray origin)
  vec3 rd = normalize(vec3(uv.x, uv.y-0.2, 0.5));  // camera aim (ray direction)
  float d = rayMarch(ro, rd);
  vec3 p = ro + rd * d;

  float dif = getLight(p, 0.3);

  if (d<MAX_DIST) {
    col = max(col,noiseAndFBM(vec3(p.x, p.y, u_time*0.06)) * vec3(0.0667, 0.6549, 0.0863));
    col = max(col,noiseAndFBM(vec3(p.x, p.y, u_time*0.07)) * vec3(0.1216, 0.3098, 0.5961));
  }
   col += vec3(dif);

  float d2 = rayMarch2(ro, rd);
  vec3 p2 = ro + rd * d2;

  float dif2 = getLight(p2, 0.2);

  if (d2<MAX_DIST) {
    col = mix(col, vec3(0.1569, 0.1529, 0.1529),0.5);
  }

   col += (col, vec3(dif2));

  gl_FragColor = vec4(col, 1.0);
}