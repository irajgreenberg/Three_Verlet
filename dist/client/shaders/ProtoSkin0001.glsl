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

// returns 3D value noise (in .x)  and its derivatives (in .yz)
// The MIT License
// Copyright © 2017 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org

// Computes the analytic derivatives of a 2D Gradient Noise

// Value    Noise 2D, Derivatives: https://www.shadertoy.com/view/4dXBRH
// Gradient Noise 2D, Derivatives: https://www.shadertoy.com/view/XdXBRH
// Value    Noise 3D, Derivatives: https://www.shadertoy.com/view/XsXfRH
// Gradient Noise 3D, Derivatives: https://www.shadertoy.com/view/4dffRH
// Value    Noise 2D             : https://www.shadertoy.com/view/lsf3WH
// Value    Noise 3D             : https://www.shadertoy.com/view/4sfGzS
// Gradient Noise 2D             : https://www.shadertoy.com/view/XdXGW8
// Gradient Noise 3D             : https://www.shadertoy.com/view/Xsl3Dl
// Simplex  Noise 2D             : https://www.shadertoy.com/view/Msf3WH
// Wave     Noise 2D             : https://www.shadertoy.com/view/tldSRj


vec2 hash( in vec2 x )  // replace this by something better
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

// return gradient noise (in x) and its derivatives (in yz)
vec3 noised( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );

#if 1
    // quintic interpolation
    vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
    vec2 du = 30.0*f*f*(f*(f-2.0)+1.0);
#else
    // cubic interpolation
    vec2 u = f*f*(3.0-2.0*f);
    vec2 du = 6.0*f*(1.0-f);
#endif    
    
    vec2 ga = hash( i + vec2(0.0,0.0) );
    vec2 gb = hash( i + vec2(1.0,0.0) );
    vec2 gc = hash( i + vec2(0.0,1.0) );
    vec2 gd = hash( i + vec2(1.0,1.0) );
    
    float va = dot( ga, f - vec2(0.0,0.0) );
    float vb = dot( gb, f - vec2(1.0,0.0) );
    float vc = dot( gc, f - vec2(0.0,1.0) );
    float vd = dot( gd, f - vec2(1.0,1.0) );

    return vec3( va + u.x*(vb-va) + u.y*(vc-va) + u.x*u.y*(va-vb-vc+vd),   // value
                 ga + u.x*(gb-ga) + u.y*(gc-ga) + u.x*u.y*(ga-gb-gc+gd) +  // derivatives
                 du * (u.yx*(va-vb-vc+vd) + vec2(vb,vc) - va));
}
// End https://www.iquilezles.org/www/articles/gradientnoise/gradientnoise.htm

// From https://www.iquilezles.org/www/articles/fbm/fbm.htm

#define numOctaves 4

float fbm(vec2 x )
{    
    float G = 0.5;
    float f = 1.0;
    float a = 1.0;
    float t = 0.0;
    for( int i=0; i<numOctaves; i++ )
    {
        t += a*noised(x).x;//added the x for dimension
        f *= 2.0;
        a *= G;
    }
    return t;
}
// End 

void main() {
// uncomment one of the two lines immediately below
  vec2 q = vUv;
  //vec2 q = gl_FragCoord.xy/u_resolution.xy;

  vec2 p = -1.0 + 2.0 * q;
  p.x *= u_resolution.x/u_resolution.y;
  vec3 bg = vec3(1.0);
  vec3 col = vec3(0.6,0.6,0.6);
  // polar coords
  float r = sqrt(dot(p, p));
  float a = atan(p.y, p.x);
  // blue green bfm mix
  col = vec3(0.0392, 0.6039, 0.5922);
  float f = fbm(5.0 *p);
  if (r<0.9){
  col = mix(col, vec3(0.251, 0.6039, 0.9098), f);
  }
  // animation stuff
  float ss = 0.5 + 0.5 *  sin(7.0 * u_time);
  float anim = 1.0 + 0.12 * ss * clamp(1.0 - r, 0.0, 1.0);
  // purple undertone pulse
  f = smoothstep(1.5, 0.2, r)/2.5;
  col = mix(col, vec3(anim, 0.2824, 0.8275), f);
  // distort angles with fbm
  a += 0.05 * fbm(18.0 * p);
  // orange pulsing
  f = smoothstep(0.025, 1.3, fbm(vec2(6.5 * r, 9.0 * a)));
  col = mix(col, vec3(0.6039, anim / 2.5, 0.1686), f);
  gl_FragColor = vec4(col * bg ,1.0);
}