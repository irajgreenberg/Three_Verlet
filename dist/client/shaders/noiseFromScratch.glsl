#ifdef GL_ES
precision mediump float;
#endif

#define SEED 1.123456789
#define HASHM mat3(40.15384,31.973157,31.179219,10.72341,13.123009,41.441023,-311.61923,10.41234,178.127121)

uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p) { 
  // from https://www.shadertoy.com/view/MtlczH
  // @aft
  // Licensed under MIT.
  
  // An attempt to create a seeded hash  
  // without sine with less artifacts.
  
  // Based on David Hoskins' idea.
  // https://www.shadertoy.com/view/4djSRW
	vec3 p3 = fract(vec3(p.x, p.y, (p.x + p.y + SEED * 1e-7)) * HASHM);
    p3 += dot(p3, p3.yzx + 41.19);
    return fract((p3.x + p3.y) * p3.z);
}

float smoothNoise(vec2 uv) {
  // based on https://www.youtube.com/watch?v=zXsWftRdsvU
  vec2 lv = fract(uv);
  lv = lv*lv*(3.0-2.0*lv);
  vec2 id = floor(uv);

  float bl = hash(id);
  float br = hash(id+vec2(1.0,0.0));
  float b = mix(bl, br, lv.x);

  float tl = hash(id+vec2(0.0,1.0));
  float tr = hash(id+vec2(1.0,1.0));
  float t = mix(tl, tr, lv.x);

  return mix(b, t, lv.y);
}

float noiseAndFBM(vec2 uv) {  // add 4 octaves
  // based on https://www.youtube.com/watch?v=zXsWftRdsvU
  float c = smoothNoise(uv*4.0);
  c += smoothNoise(uv*8.0) * 0.5;
  c += smoothNoise(uv*16.0) * 0.25;
  c += smoothNoise(uv*32.0) * 0.125;
  c += smoothNoise(uv*64.0) * 0.0625;
  c /= 2.0; // divide to keep within 1;
  return c;
}

void main(void) {
  vec2 uv = gl_FragCoord.xy/u_resolution.xy;
  uv += u_time * 0.1;
  float c = noiseAndFBM(uv);
  vec3 col = vec3(c);
//  col.rg = id * 0.1;//lv;
  gl_FragColor = vec4(col, 1.0);
}