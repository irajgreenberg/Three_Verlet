#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define PHI 1.61803398875
#define TAU 6.28318531
#define QTR_PI 0.78539816

uniform vec2 u_resolution;
uniform float u_time;

// 4 
float stroke(float x, float s, float w){
  float d = step(s,x+w*.5)-step(s,x-w*.5);
  return clamp(d, 0.,1.);
}

// 8
float circleSDF(vec2 st) {
  return length(st -.5)*2.;
}

// 9
float fill(float x, float size){
  return 1.-step(size, x);
}

// 10
float rectSDF(vec2 st, vec2 s) {
  st = st*2.-1.;
  return max(abs(st.x/s.x),
             abs(st.y/s.y));
}

// 11
float crossSDF(vec2 st, float s) {
  vec2 size = vec2(.25, s);
  return min(rectSDF(st, size.xy),
             rectSDF(st, size.yx));
}

// 12
float flip(float v, float pct){
  return mix(v, 1.-v, pct);
}

// 14
float vesicaSDF(vec2 st, float w){
  vec2 offset = vec2(w*.5,0.);
  return max(circleSDF(st-offset), circleSDF(st+offset));
}

// 15
float triSDF(vec2 st) {
  st = (st*2.-1.)*2.;
  return max(abs(st.x) * 0.866025 + st.y * 0.5, -st.y * 0.5);
}

// 17
float rhombSDF(vec2 st){
  return max(triSDF(st), triSDF(vec2(st.x,1.-st.y)));
}

// 19
vec2 rotate(vec2 st, float a) { //angle 0 is top and rotates ccw
  st = mat2(cos(a),-sin(a),sin(a), cos(a))*(st-.5);
  return st+.5;
}

// 26 
  float polySDF(vec2 st, int V) {
    st = st*2.-1.;
    float a = atan(st.x, st.y)+PI;
    float r = length(st);
    float v = TAU/float(V);
    return cos(floor(.5+a/v)*v-a)*r;
  }

// 27
  float hexSDF(vec2 st) {
    st = abs(st*2.-1.);
    return max(abs(st.y), st.x * 0.866025 + st.y * 0.5);
  }

// 28
  float starSDF(vec2 st, int V, float s) {
    st = st *4.-2.;
    float a = atan(st.y, st.x)/TAU;
    float seg = a * float(V);
    a = ((floor(seg) + 0.5)/float(V) + 
        mix(s, -s, step(.5,fract(seg)))) * TAU;
        return abs(dot(vec2(cos(a), sin(a)),st));
  }

// 30
  float raysSDF(vec2 st, int N) {
    st -= .5;
    return fract(atan(st.y, st.x)/TAU * float(N));
  }

// figure out SDF vs fill(sdf) - triSDF for example
void main(void) {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  vec3 color = vec3(0.,0.,0.);//0

// 30 d4 d9 d28
  color+= stroke(raysSDF(st,8),.5,.15);
  float inner = starSDF(st.xy, 6, .09);
  float outer = starSDF(st.yx, 6, .09);
  color *= step(.7,outer);
  color += fill(outer, .5);
  color -= stroke(inner, .25, .06);
  color += stroke(outer, .6, .05);
// 29 d4 d9 d19 d26 d28
  // float bg = starSDF(st,16,.1);
  // color += fill(bg,1.3);
  // float l = 0.;
  // for (float i = 0.; i < 8.; i++) {
  //   vec2 xy = rotate(st,QTR_PI*i);
  //   xy.y -= .3;
  //   float tri = polySDF(xy,3);
  //   color += fill(tri,.3);
  //   l += stroke(tri,.3,.03);
  // }
  // color *= 1.-l;
  // float c = polySDF(st,8);
  // color -= stroke(c,.15,.04);
// 28 d4 d8
  // color += stroke(circleSDF(st),.8,.05);
  // st.y = 1.-st.y;
  // float s = starSDF(st.yx, 5, .1);
  // color *= step(.7, s);
  // color += stroke(s, .4, .1);
// 27 d4 d9
  // st = st.yx;
  // color += stroke(hexSDF(st),.6,.1);
  // color += fill(hexSDF(st-vec2(-.06,-.1)),.15);
  // color += fill(hexSDF(st-vec2(-.06,.1)),.15);
  // color += fill(hexSDF(st-vec2(.11,0.)),.15);
// 26 d9
  // float d1 = polySDF(st,5);
  // vec2 ts = vec2(st.x, 1.-st.y);
  // float d2 = polySDF(ts,5);
  // color += fill(d1,.75) * fill(fract(d1*5.),.5);
  // color -= fill(d1,.6) * fill(fract(d2*4.9),.45);
// 25 d4 d10 d19
  // st = rotate(st, radians(-45.))-.08;
  // for (int i = 0; i < 4; i++) {
  //   float r = rectSDF(st, vec2(1.));
  //   color += stroke(r,.19,.04);
  //   st += .05;
  // }
// 24 d4 d9 d10 d19
  // st = rotate(st,radians(45.));
  // float r1 = rectSDF(st, vec2(1.));
  // float r2 = rectSDF(st+.15, vec2(1.));
  // color += stroke(r1, .5, .05);
  // color *= step(.325, r2);
  // color += stroke(r2, .325, .05) * fill(r1,.525);
  // color += stroke(r2,.2,.05);
// 23 d9 d10 d12 d19
  // st = rotate(st, radians(-45.));
  // vec2 s = vec2(1.);
  // float o = .05;
  // color += flip(fill(rectSDF(st-o, s), .4),
  //               fill(rectSDF(st+o, s), .4));
// 22 d9 d10 d19
  // st = rotate(vec2(st.x,1.0-st.y), radians(45.));
  // vec2 s =  vec2(1.);
  // color += fill(rectSDF(st - .025, s),.4);
  // color += fill(rectSDF(st + .025, s),.4);
  // color *= step(.38,rectSDF(st+.025,s));
// 21 d9 d10 d19
  // st = rotate(st, radians(-45.));
  // float off = .12;
  // vec2 s = vec2(1.);
  // color += fill(rectSDF(st+off,s),.2);
  // color += fill(rectSDF(st-off,s),.2);
  // float r = rectSDF(st,s);
  // color *= step(.33,r);
  // color += fill(r,.3);
// 20 d4 d9 d10 d19
  // st = rotate(st, radians(45.));
  // color += fill(rectSDF(st,vec2(1.)),.4);
  // color *= 1.-stroke(st.x,.5,.02);
  // color *= 1.-stroke(st.y,.5,.02);
// 19 d9 d15
  // st = rotate(st, radians(-25.));
  // float sdf = triSDF(st);
  // sdf /= triSDF(st+vec2(0.,.2));
  // color += fill(abs(sdf),.56);
// 18 d4 d9d d12 d15 d17
  // color += flip(fill(triSDF(st),.5),fill(rhombSDF(st),.4));
// 17 d4 d9 d16
  // float sdf = rhombSDF(st);
  // color += fill(sdf,.425);
  // color += stroke(sdf,.5,.05);
  // color += stroke(sdf,.6,.03);
// 16 d4 d8 d9 d15
  // float circle = circleSDF(st-vec2(.0,.1));
  // float triangle = triSDF(st+vec2(.0,.1));
  // color += stroke(circle,.45,.1);
  // color *= step(.55, triangle);
  // color += fill(triangle,.45);
// 15 d9
  // st.y = 1.-st.y;
  // vec2 ts = vec2(st.x,.82-st.y);
  // color += fill(triSDF(st),.7);
  // color -= fill(triSDF(ts),.36);
// 14 d8 d9 d12
  // float sdf = vesicaSDF(st,.2);
  // color += flip(fill(sdf,.5), step((st.x+st.y)*.5,.5));
// 13 d4 d8 d9 d12
  // vec2 offset = vec2(.15,.0);
  // float left = circleSDF(st+offset);
  // float right = circleSDF(st-offset);
  // color += flip(stroke(left,.5,.05),fill(right,.525));
// 12 d4 9 d10
  // float rect = rectSDF(st, vec2(.5,1.));
  // float diag =  (st.x+st.y)*.5;
  // color += flip(fill(rect,.6), stroke(diag,.5,.01));
// 11 d4 d9 d10
  // float rect = rectSDF(st, vec2(1.));
  // color += fill(rect,.5);
  // float cross = crossSDF(st,1.);
  // color *= step(.5,fract(cross*4.));
  // color *= step(1.,cross);
  // color += fill(cross,.5);
  // color += stroke(rect,.65,.05);
  // color += stroke(rect,.75,.025);
// 10 d4 d9
  // float sdf = rectSDF(st, vec2(1.));
  // color += stroke(sdf,.5,.125);
  // color+= fill(sdf,.1);
// 9 d8
  // color += fill(circleSDF(st),.65);
  // vec2 offset = vec2(.1,.05);
  // color -= fill(circleSDF(st-offset),.5);
// 8 d4
  // color += stroke(circleSDF(st),.5,.05);
// 7 d4
  // float sdf = .5+(st.x-st.y)*.5;
  // color += stroke(sdf,.5,.1);
  // float sdf_inv = (st.x+st.y)*.5;
  // color += stroke(sdf_inv,.5,.1);
// 6 d4
  // float sdf = .5+(st.x-st.y)*.5;
  // color += stroke(sdf,.5,.1);
//5 d4
  // float offset = cos(st.y*PI)*.15;
  // color += stroke(st.x,.28 + offset,.1);
  // color += stroke(st.x,.5 + offset,.1);
  // color += stroke(st.x,.72 + offset,.1);
//4
  // color += stroke(st.x, .5, .15);
//3
  // color += step(.5,(st.x+st.y)*.5);
//2
  // color += step(.5+cos(st.y*PI)*.25,st.x);
//1
  // color += step(.5,st.x);

  gl_FragColor = vec4(color, .5);
}

