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

void main(void) {
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
