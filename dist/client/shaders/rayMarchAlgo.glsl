//Thanks to @The_ArtOfCode for teaching me to rayMarch: 
//https://www.youtube.com/watch?v=PGtv-dBi2wE
//https://www.youtube.com/watch?v=Ff0jJyyiVyw

#ifdef GL_ES                // do it if GL_ES is defined (context present)}
precision mediump float;    // ets precision for floats (speed vs qual)
# endif

#define PI 3.14159265359
#define MAX_STEPS 100
#define SURFACE_DIST 0.01
#define MAX_DIST 100.0

varying vec2 vUv;

uniform vec2 u_resolution;
uniform float u_time;

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 ab = b-a;
  vec3 ap = p-a;
  float t = dot(ab, ap) / dot(ab, ab);
  t = clamp(t, 0.0, 1.0);
  vec3 c = a + t*ab;
  return length(p-c) - r;
}

float sdTorus(vec3 p, vec2 r) {
  float x = length(p.xz) - r.x;
  return length(vec2(x, p.y))-r.y;
}

float sdBox(vec3 p, vec3 s) {
  return length(max(abs(p)-s, 0.0));
}

float sdCyl(vec3 p, vec3 a, vec3 b, float r) {
  vec3 ab = b-a;
  vec3 ap = p-a;
  float t = dot(ab, ap) / dot(ab, ab);
//  t = clamp(t, 0.0, 1.0);// remove for infinite cylinder
  vec3 c = a + t*ab;
  float x = length(p-c) - r;
  float y = (abs(t - 0.5) - 0.5) * length(ab);
  float e = length(max(vec2(x, y), 0.0));
  float i = min(max(x, y), 0.0);  // use only if needed - extra cost
  return e + i;
}

float getDist(vec3 p) {
  // distance to sphere: Length of Vector - radius
  vec4 s = vec4(-1.0, 2.0, 7.0, 1.0);
  float sphereDist = length(p-s.xyz)-s.w;  
  // distance to y-axis-aligned plane: the axis
  float planeDist = p.y;  
  // distance to capsule 
  float capsDist = sdCapsule(p, vec3(0.0, 1.0, 6.0), vec3(1.0, 2.0, 6.0), 0.2);
  // distance to torus
  float torDist = sdTorus(p-vec3(0.0, 0.5, 6.0), vec2(1.5, 0.3));
  //  distance to box
  float boxDist = sdBox(p-vec3(-3.0,0.75,6.0), vec3(0.75));
  // distance to capped cylinder
  float cylDist = sdCyl(p, vec3(0.0, 0.3, 4.0), vec3(3.0, 0.3, 5.0), 0.3);

  float d = capsDist;
  d = min(d, sphereDist);
  d = min(d, planeDist);
  d = min(d, torDist);
  d = min(d, boxDist);
  d = min(d, cylDist);
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

vec3 getNormal(vec3 p) {
  float d = getDist(p);
  vec2 e = vec2(0.01, 0.0);
  vec3 n = d - vec3(  //swizzle of e to find points around for slope
    getDist(p-e.xyy),
    getDist(p-e.yxy),
    getDist(p-e.yyx));
  return normalize(n);
}

float getLight(vec3 p) {
  vec3 lightPos = vec3(0.0, 5.0, 6.0);
  lightPos.xz += vec2(sin(u_time), cos(u_time)) * 2.0;
  vec3 l = normalize(lightPos - p);
  vec3 n = getNormal(p);
  float dif = clamp(dot(n, l), 0.0, 1.0);
  // get shadow
  float d  = rayMarch(p +n*SURFACE_DIST * 2.0, l);
  if (d < length(lightPos - p)) dif *= 0.1;
  return dif;
}

void main() {
  vec2 uv = (gl_FragCoord.xy-(0.5*u_resolution.xy))/u_resolution.y;
  vec3 col = vec3(0.0);

  vec3 ro = vec3(0.0, 2.0, 0.1);  // camera position (ray origin)
  vec3 rd = normalize(vec3(uv.x, uv.y-0.2, 1.0));  // camera aim (ray direction)

  float d = rayMarch(ro, rd);

  vec3 p = ro + rd * d;

  float dif = getLight(p);

  col = vec3(dif);
 
  gl_FragColor = vec4(col, 1.0);
}