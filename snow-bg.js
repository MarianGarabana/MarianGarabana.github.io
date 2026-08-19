/* ============================================================================
   PIXEL SNOW BACKGROUND, shared by index and every project page.
   Extracted from index.html on Aug 17 2026, when the same background was asked
   for on the project pages. The shader and every prop below are byte-identical
   to the version that shipped on index; the only new thing is where the color
   comes from (see COLOR below), because the project pages do not carry
   --accent. Ten inline copies of 250 lines was the alternative.

   TO PUT IT ON A PAGE, two lines, no other change:
     <canvas id="snowBg" data-color="#RRGGBB" aria-hidden="true"></canvas>
        right after <body>, and
     <script src="snow-bg.js" defer></script>
        right before </body>.
   The #snowBg rules live in styles.css, which every page already loads.

   IT SITS BEHIND EVERYTHING. The canvas is fixed at z-index -1, above the page
   background and below every piece of in-flow content. Any section that paints
   an opaque background of its own hides it, which is exactly how the project
   heroes keep the snow out: .vhero paints #0c0e11 and runs a video over it, so
   the flakes start where the hero ends. Nothing needs a stacking change.

   Ported from react-bits PixelSnow (JS-CSS). That component is React plus
   three.js, which this repo does not ship; three was only being used to put one
   fragment shader on a fullscreen quad, so the shader is kept and the wrapper
   is raw WebGL2 instead. Nothing installed, no dependency added. Do NOT run
   `npx shadcn add` for it: components.json points `tailwind.css` at the real
   styles.css and the component drags in three@0.180.
   ========================================================================== */
(function(){
  var cv = document.getElementById('snowBg'); if(!cv) return;
  var root = document.documentElement;
  /* No canvas, no loop, no context: reduced motion is decided before any GPU
     work is set up, not by pausing something already running. */
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ cv.remove(); return; }

  /* Her settings, from the react-bits props. Degrees here, radians in the
     uniform, exactly as the component converts them.

     COLOR COMES FROM THE PAGE, not from the props. The demo's #fb1ad9 is a
     different magenta from this site's, so the flakes would read as a second
     pink next to the buttons and the nav pill. */
  /* COLOR, in order: the canvas's own data-color, then --accent off <body>,
     then the homepage pink. index.html has no data-color and keeps reading the
     token, so its behavior is unchanged. The project pages each name their own
     hex, because none of them declares --accent: their accents are per-page
     tokens (--cyan, --orange, --violet-ink and so on) with no shared name.

     READ IT OFF <body>, NOT <html>. This site's dark accent is declared on
     body.idx-dark; :root carries the cream-page value, which is #111110, a
     near-black. Measured: reading from documentElement painted invisible
     flakes on a dark canvas and looked like a broken shader. */
  var accent = (cv.getAttribute('data-color') || '').trim();
  if(!/^#[0-9a-f]{6}$/i.test(accent)){
    accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
  }
  if(!/^#[0-9a-f]{6}$/i.test(accent)) accent = '#FF3D7F';
  var P = { color:accent, flakeSize:0.011, minFlakeSize:1.5, pixelResolution:500,
            speed:0.85, depthFade:8, farPlane:25, brightness:1, gamma:0.4545,
            density:0.3, variant:1 /* 0 square, 1 round, 2 snowflake */, direction:75 };

  var gl = cv.getContext('webgl2', { alpha:true, premultipliedAlpha:false,
    antialias:false, depth:false, stencil:false, powerPreference:'high-performance' });
  /* No WebGL2 means no background and no error. The page has never depended on
     this canvas for anything. */
  if(!gl){ cv.remove(); return; }

  var VERT = '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';

  /* The fragment shader is react-bits' own, unchanged except for three things
     GLSL ES 3.00 requires and three.js was hiding: the version line, fragColor
     in place of gl_FragColor, and highp integers. The last one is not cosmetic.
     The flake field comes out of an integer hash, and mediump uints are allowed
     to be 16-bit, which would collapse the hash and stripe the snow on mobile. */
  var FRAG = ['#version 300 es',
  'precision highp float;',
  'precision highp int;',
  'out vec4 fragColor;',
  'uniform float uTime;uniform vec2 uResolution;uniform float uFlakeSize;',
  'uniform float uMinFlakeSize;uniform float uPixelResolution;uniform float uSpeed;',
  'uniform float uDepthFade;uniform float uFarPlane;uniform vec3 uColor;',
  'uniform float uBrightness;uniform float uGamma;uniform float uDensity;',
  'uniform float uVariant;uniform float uDirection;',
  '#define PI_OVER_6 0.5235988',
  '#define PI_OVER_3 1.0471976',
  '#define M1 1597334677U',
  '#define M2 3812015801U',
  '#define M3 3299493293U',
  '#define F0 2.3283064e-10',
  '#define hash(n) (n * (n ^ (n >> 15)))',
  '#define coord3(p) (uvec3(p).x * M1 ^ uvec3(p).y * M2 ^ uvec3(p).z * M3)',
  'const vec3 camK = vec3(0.57735027, 0.57735027, 0.57735027);',
  'const vec3 camI = vec3(0.70710678, 0.0, -0.70710678);',
  'const vec3 camJ = vec3(-0.40824829, 0.81649658, -0.40824829);',
  'const vec2 b1d = vec2(0.574, 0.819);',
  'vec3 hash3(uint n){ uvec3 hashed = hash(n) * uvec3(1U, 511U, 262143U);',
  '  return vec3(hashed) * F0; }',
  'float snowflakeDist(vec2 p){',
  '  float r = length(p); float a = atan(p.y, p.x);',
  '  a = abs(mod(a + PI_OVER_6, PI_OVER_3) - PI_OVER_6);',
  '  vec2 q = r * vec2(cos(a), sin(a));',
  '  float dMain = max(abs(q.y), max(-q.x, q.x - 1.0));',
  '  float b1t = clamp(dot(q - vec2(0.4, 0.0), b1d), 0.0, 0.4);',
  '  float dB1 = length(q - vec2(0.4, 0.0) - b1t * b1d);',
  '  float b2t = clamp(dot(q - vec2(0.7, 0.0), b1d), 0.0, 0.25);',
  '  float dB2 = length(q - vec2(0.7, 0.0) - b2t * b1d);',
  '  return min(dMain, min(dB1, dB2)) * 10.0; }',
  'void main(){',
  '  float invPixelRes = 1.0 / uPixelResolution;',
  '  float pixelSize = max(1.0, floor(0.5 + uResolution.x * invPixelRes));',
  '  float invPixelSize = 1.0 / pixelSize;',
  '  vec2 fragCoord = floor(gl_FragCoord.xy * invPixelSize);',
  '  vec2 res = uResolution * invPixelSize;',
  '  float invResX = 1.0 / res.x;',
  '  vec3 ray = normalize(vec3((fragCoord - res * 0.5) * invResX, 1.0));',
  '  ray = ray.x * camI + ray.y * camJ + ray.z * camK;',
  '  float timeSpeed = uTime * uSpeed;',
  '  float windX = cos(uDirection) * 0.4;',
  '  float windY = sin(uDirection) * 0.4;',
  '  vec3 camPos = (windX * camI + windY * camJ + 0.1 * camK) * timeSpeed;',
  '  vec3 pos = camPos;',
  '  vec3 absRay = max(abs(ray), vec3(0.001));',
  '  vec3 strides = 1.0 / absRay;',
  '  vec3 raySign = step(ray, vec3(0.0));',
  '  vec3 phase = fract(pos) * strides;',
  '  phase = mix(strides - phase, phase, raySign);',
  '  float rayDotCamK = dot(ray, camK);',
  '  float invRayDotCamK = 1.0 / rayDotCamK;',
  '  float invDepthFade = 1.0 / uDepthFade;',
  '  float halfInvResX = 0.5 * invResX;',
  '  vec3 timeAnim = timeSpeed * 0.1 * vec3(7.0, 8.0, 5.0);',
  '  float t = 0.0;',
  '  for (int i = 0; i < 128; i++) {',
  '    if (t >= uFarPlane) break;',
  '    vec3 fpos = floor(pos);',
  '    uint cellCoord = coord3(fpos);',
  '    float cellHash = hash3(cellCoord).x;',
  '    if (cellHash < uDensity) {',
  '      vec3 h = hash3(cellCoord);',
  '      vec3 sinArg1 = fpos.yzx * 0.073;',
  '      vec3 sinArg2 = fpos.zxy * 0.27;',
  '      vec3 flakePos = 0.5 - 0.5 * cos(4.0 * sin(sinArg1) + 4.0 * sin(sinArg2) + 2.0 * h + timeAnim);',
  '      flakePos = flakePos * 0.8 + 0.1 + fpos;',
  '      float toIntersection = dot(flakePos - pos, camK) * invRayDotCamK;',
  '      if (toIntersection > 0.0) {',
  '        vec3 testPos = pos + ray * toIntersection - flakePos;',
  '        float testX = dot(testPos, camI);',
  '        float testY = dot(testPos, camJ);',
  '        vec2 testUV = abs(vec2(testX, testY));',
  '        float depth = dot(flakePos - camPos, camK);',
  '        float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * halfInvResX);',
  '        float dist;',
  '        if (uVariant < 0.5) { dist = max(testUV.x, testUV.y); }',
  '        else if (uVariant < 1.5) { dist = length(testUV); }',
  '        else { float invFlakeSize = 1.0 / flakeSize;',
  '          dist = snowflakeDist(vec2(testX, testY) * invFlakeSize) * flakeSize; }',
  /* ANTIALIASED RIM. The original tests dist < flakeSize and writes alpha 1, so
     every flake is a hard-edged stamp: fine when a flake was three screen pixels
     of a deliberate pixel grid, jagged once it is drawn at full resolution.

     aa is the width of one screen pixel measured in the same world units as
     dist. One pixel step turns the ray by 1/res.x, and the intersection sits
     (t + toIntersection) away, so their product is the footprint. Computed
     rather than taken from fwidth() on purpose: this is inside a loop and two
     branches, and derivatives in divergent control flow are undefined.

     Coverage goes to alpha, not to brightness, so a rim pixel is a partly
     transparent flake rather than a dim one and the disc keeps its color. */
  '        float aa = max((t + toIntersection) * invResX, 1e-6);',
  '        if (dist < flakeSize + aa) {',
  '          float cov = 1.0 - smoothstep(flakeSize - aa, flakeSize + aa, dist);',
  '          float flakeSizeRatio = uFlakeSize / flakeSize;',
  '          float intensity = exp2(-(t + toIntersection) * invDepthFade) *',
  '                            min(1.0, flakeSizeRatio * flakeSizeRatio) * uBrightness;',
  '          fragColor = vec4(uColor * pow(vec3(intensity), vec3(uGamma)), cov);',
  '          return; } } }',
  '    float nextStep = min(min(phase.x, phase.y), phase.z);',
  '    vec3 sel = step(phase, vec3(nextStep));',
  '    phase = phase - nextStep + strides * sel;',
  '    t += nextStep;',
  '    pos = mix(pos + ray * nextStep, floor(pos + ray * nextStep + 0.5), sel); }',
  '  fragColor = vec4(0.0); }'].join('\n');

  function compile(type, src){
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      /* Loud on purpose. A silently blank canvas would look like a design
         decision rather than a broken shader. */
      console.error('snowBg shader:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if(!vs || !fs){ cv.remove(); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.error('snowBg link:', gl.getProgramInfoLog(prog)); cv.remove(); return;
  }
  gl.useProgram(prog);

  /* One triangle covering the viewport, not two. Fewer vertices and no seam
     down the diagonal. */
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  function U(n){ return gl.getUniformLocation(prog, n); }
  var uTime = U('uTime'), uRes = U('uResolution');
  var rgb = [parseInt(P.color.slice(1,3),16)/255, parseInt(P.color.slice(3,5),16)/255,
             parseInt(P.color.slice(5,7),16)/255];
  gl.uniform1f(U('uFlakeSize'), P.flakeSize);
  gl.uniform1f(U('uMinFlakeSize'), P.minFlakeSize);
  gl.uniform1f(U('uPixelResolution'), P.pixelResolution);
  gl.uniform1f(U('uSpeed'), P.speed);
  gl.uniform1f(U('uDepthFade'), P.depthFade);
  gl.uniform1f(U('uFarPlane'), P.farPlane);
  gl.uniform3f(U('uColor'), rgb[0], rgb[1], rgb[2]);
  gl.uniform1f(U('uBrightness'), P.brightness);
  gl.uniform1f(U('uGamma'), P.gamma);
  gl.uniform1f(U('uDensity'), P.density);
  gl.uniform1f(U('uVariant'), P.variant);
  gl.uniform1f(U('uDirection'), P.direction * Math.PI / 180);

  /* FULL RESOLUTION, no pixel grid. Aug 17 2026, at Marian's request: the
     flakes are round dots now, not pixel blocks.

     The backing store is the real device-pixel size of the viewport, capped at
     2x like the react-bits component does, and uPixelResolution is handed the
     backing width so the shader's own quantiser resolves to 1 and never
     buckets a fragment. That is 9x the fragments of the pixel-grid version at
     1440 and about 36x at 1440 on a retina display, which is why the cap
     matters.

     uMinFlakeSize is a floor in PIXELS, so it has to be rescaled with the grid
     or the smallest flakes would shrink to sub-pixel specks at full
     resolution. 1.5 of her 500-wide blocks is what she approved; multiplying by
     backing/500 keeps that same apparent size on screen at any density. */
  var w = 0, h = 0, uMin = U('uMinFlakeSize'), uPixRes = U('uPixelResolution');
  function size(){
    var dpr = Math.min(devicePixelRatio || 1, 2);
    var bw = Math.max(1, Math.round(innerWidth * dpr));
    var bh = Math.max(1, Math.round(innerHeight * dpr));
    if(bw === w && bh === h) return;
    w = bw; h = bh; cv.width = bw; cv.height = bh;
    gl.viewport(0, 0, bw, bh);
    gl.uniform2f(uRes, bw, bh);
    gl.uniform1f(uPixRes, bw);
    gl.uniform1f(uMin, P.minFlakeSize * (bw / P.pixelResolution));
  }
  size();

  var raf = 0, t0 = performance.now(), rt = 0;
  /* It runs from the top of the page now that it is the hero background as
     well. The only reasons to stop are the two motion switches and a tab
     nobody is looking at. */
  function wanted(){
    return !root.classList.contains('motion-paused') && !document.hidden;
  }
  function frame(now){
    raf = requestAnimationFrame(frame);
    gl.uniform1f(uTime, (now - t0) * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function tick(){
    var want = wanted();
    if(want && !raf){ t0 = performance.now() - rt; raf = requestAnimationFrame(frame); }
    else if(!want && raf){ rt = performance.now() - t0; cancelAnimationFrame(raf); raf = 0; }
    cv.classList.toggle('on', want);
  }
  addEventListener('resize', function(){ size(); tick(); });
  document.addEventListener('visibilitychange', tick);
  /* main.js writes .motion-paused onto <html> from the footer button, and that
     button is built after this script runs, so watch the class rather than the
     control. */
  new MutationObserver(tick).observe(root, { attributes:true, attributeFilter:['class'] });
  tick();
})();
