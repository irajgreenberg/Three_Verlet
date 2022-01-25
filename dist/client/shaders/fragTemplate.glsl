#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform sampler2D tex0;
//uniform sampler2d tex1;
//uniform sampler2d fft;
//uniform vec4 unPar;
//uniform vec4 unPos;

void main(void) {
  vec2 uv = gl_FragCoord.xy/u_resolution.xy;
  vec3 col = vec3(0.0);
  gl_FragColor = vec4(col, 1.0);
}