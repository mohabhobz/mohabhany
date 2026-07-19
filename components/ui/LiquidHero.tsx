"use client";

import { useEffect, useRef } from "react";

/**
 * The liquid behind the hero.
 *
 * One fullscreen triangle, one fragment shader, one draw call per frame.
 * No library, no DOM nodes, no layout, no compositing tricks. The CPU does
 * nothing except hand the GPU a time value, which is why this can run
 * behind a scrolling page without costing anything.
 *
 * The alternative everyone reaches for first is blurred divs merged with
 * filter: blur() + contrast() — the "gooey" trick. It looks right and it
 * is the same class of expense as backdrop-filter: the compositor
 * re-blurs a large surface every frame. We already removed one of those
 * from this page.
 *
 * The motion is three things stacked, in the order heavy liquid actually
 * behaves:
 *   1. a slow downward drift
 *   2. pooling — density rises toward the bottom, so it gathers rather
 *      than falling off the edge
 *   3. a lazy swirl whose speed falls off with radius, which is what
 *      makes it read as viscous instead of gaseous
 * The pointer adds a fourth, a soft push that decays.
 */

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;

out vec4 outColor;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;     // 0..1, smoothed
uniform float uPointerAmt;  // decays to 0 when the pointer leaves
uniform vec3  uInk;         // liquid colour
uniform vec3  uAccent;
uniform vec3  uBg;

/* Value noise. Cheaper than simplex and the difference is invisible once
   it is warped and blurred by fbm. */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);          // smoothstep, not linear
  return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {              // 5 octaves is the point where
    v += a * noise(p);                       // adding more stops being visible
    p = p * 2.02 + 17.3;                     // 2.02 not 2.0: exact doubling
    a *= 0.5;                                // makes the octaves line up and
  }                                          // the grid starts to show
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p  = uv;
  p.x *= uRes.x / uRes.y;                    // square the domain

  float t = uTime * 0.06;

  /* 3. The swirl. Angle falls off with radius, so the middle turns and the
     edges lag. That velocity gradient is the whole reason it reads heavy. */
  vec2  c = p - vec2(0.5 * uRes.x / uRes.y, 0.62);
  float r = length(c);
  float a = atan(c.y, c.x) + t * 0.9 / (1.0 + r * 3.5);
  p = vec2(0.5 * uRes.x / uRes.y, 0.62) + vec2(cos(a), sin(a)) * r;

  /* The pointer pushes the field away from itself and the push decays. */
  vec2 ptr = uPointer * vec2(uRes.x / uRes.y, 1.0);
  vec2 d   = p - ptr;
  p += normalize(d + 1e-5) * exp(-dot(d, d) * 9.0) * 0.12 * uPointerAmt;

  /* 1. Downward drift, and 2. domain warping: fbm of an fbm. This is what
     turns noise into something that looks like it is flowing rather than
     shimmering in place. */
  vec2 q = vec2(fbm(p + vec2(0.0, -t * 1.6)),
                fbm(p + vec2(5.2, 1.3) - vec2(0.0, t * 1.1)));
  vec2 s = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) - vec2(0.0, t * 0.7)),
                fbm(p + 3.0 * q + vec2(8.3, 2.8)));
  float f = fbm(p + 2.4 * s);

  /* 2. Pooling. Density rises toward the bottom of the screen, so the
     liquid gathers and settles instead of draining away. */
  float pool = smoothstep(0.0, 0.95, 1.0 - uv.y);
  f = mix(f, f * 1.35 + 0.10, pool * 0.75);

  /* Bands read as depth in a thick fluid: the surface layers separate
     rather than blending into a single fog. */
  float band = smoothstep(0.42, 0.72, f);
  float deep = smoothstep(0.30, 0.95, f);

  vec3 col = uBg;
  col = mix(col, uInk, band * 0.55);
  col = mix(col, uAccent, pow(deep, 3.0) * 0.16 * (0.35 + 0.65 * pool));

  /* A single soft specular. Enough to say "wet"; more would say "chrome". */
  float spec = pow(smoothstep(0.55, 0.85, f), 6.0);
  col += spec * 0.05;

  /* Dither. Without it, a gradient this shallow bands visibly on 8-bit
     panels, which is the exact artefact we spent the cover fade fixing. */
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

  outColor = vec4(col, 1.0);
}`;

function readVar(el: HTMLElement, name: string): [number, number, number] {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  const rgb = v.match(/(\d+(?:\.\d+)?)/g);
  if (rgb && rgb.length >= 3) return [+rgb[0] / 255, +rgb[1] / 255, +rgb[2] / 255];
  return [0, 0, 0];
}

export function LiquidHero() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl2", {
      antialias: false,           // the shader is smooth; MSAA buys nothing
      alpha: false,
      powerPreference: "low-power",
      depth: false,
      stencil: false,
    });
    if (!gl) return;              // no WebGL2: the section keeps its flat background

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    /* One triangle that covers the viewport, not two. Half the vertices and
       no seam down the diagonal. */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      ptr: gl.getUniformLocation(prog, "uPointer"),
      ptrAmt: gl.getUniformLocation(prog, "uPointerAmt"),
      ink: gl.getUniformLocation(prog, "uInk"),
      accent: gl.getUniformLocation(prog, "uAccent"),
      bg: gl.getUniformLocation(prog, "uBg"),
    };

    const root = document.documentElement;
    const pushColours = () => {
      gl.uniform3fv(U.ink, readVar(root, "--color-surface"));
      gl.uniform3fv(U.accent, readVar(root, "--color-accent"));
      gl.uniform3fv(U.bg, readVar(root, "--color-bg"));
    };
    pushColours();

    /* Theme flips have to reach the shader; nothing else would tell it. */
    const themeObserver = new MutationObserver(pushColours);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    let dpr = 1;
    const resize = () => {
      /* Capped at 1.5. This is pure fill rate: at DPR 3 on a large screen the
         shader runs on four times the pixels for a difference nobody can see
         through this much blur. */
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(U.res, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* Pointer is smoothed toward the real position; the amount decays when
       the pointer leaves so the liquid relaxes instead of snapping back. */
    let px = 0.5, py = 0.5, tx = 0.5, ty = 0.5, amt = 0, targetAmt = 0;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1 - (e.clientY - r.top) / r.height;
      targetAmt = 1;
    };
    const onLeave = () => { targetAmt = 0; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });

    /* Do not render a surface nobody is looking at. */
    let onScreen = true;
    const io = new IntersectionObserver(
      ([e]) => { onScreen = e.isIntersecting; if (onScreen && !reduce) start(); },
      { threshold: 0 },
    );
    io.observe(canvas);

    let raf = 0, running = false;
    const t0 = performance.now();

    const frame = (now: number) => {
      if (!onScreen || document.hidden) { running = false; return; }
      px += (tx - px) * 0.045;                  // heavy: it lags the cursor
      py += (ty - py) * 0.045;
      amt += (targetAmt - amt) * 0.03;
      gl.uniform2f(U.ptr, px, py);
      gl.uniform1f(U.ptrAmt, amt);
      gl.uniform1f(U.time, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      /* One frame, held. The composition is the point; the motion is not. */
      gl.uniform2f(U.ptr, 0.5, 0.5);
      gl.uniform1f(U.ptrAmt, 0);
      gl.uniform1f(U.time, 12.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      start();
    }

    const onVis = () => { if (!document.hidden && onScreen && !reduce) start(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} className="liquid" aria-hidden="true" />;
}
