"use client";

import { useEffect, useRef } from "react";

/**
 * The pour.
 *
 * Liquid arrives over the top edge, runs down the screen, reaches about
 * two thirds, and drains away. It happens once when the hero comes into
 * view and then it is gone. It is an entrance, not wallpaper.
 *
 * One fullscreen triangle, one fragment shader, one draw call per frame,
 * and the loop stops itself the moment the pour finishes — so the steady
 * state of this page is zero work, not a permanent animation.
 *
 * What makes it read as liquid rather than a rising rectangle is entirely
 * in the leading edge: it is displaced by two noise fields at different
 * frequencies, so the front is uneven and some parts run ahead of others
 * as tongues. A straight edge would read as a wipe transition.
 */

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  uRes;
uniform float uTime;      // seconds inside the current drop, loops
uniform vec3  uInk;
uniform vec3  uAccent;

const float FALL   = 3.6;   // stream descending
const float BLOOM  = 5.4;   // spreading after impact
const float FADE   = 3.2;   // dissipating
const float GAP    = 1.6;   // empty water before the next drop
const float FLOOR  = 0.20;  // where it lands, in uv.y

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 19.1; a *= 0.5; }
  return v;
}

void main() {
  float ar = uRes.x / uRes.y;
  vec2  uv = gl_FragCoord.xy / uRes;
  vec2  p  = vec2((uv.x - 0.5) * ar, uv.y);
  float t  = uTime;

  /* ---- the head of the stream ------------------------------------
     Accelerating, because it is falling. Reaches FLOOR at t = FALL. */
  float fall = clamp(t / FALL, 0.0, 1.0);
  float head = mix(1.05, FLOOR, fall * fall);

  /* ---- the stream -------------------------------------------------
     A thin filament, not a sheet. Three things make it read as ink:
       1. the centre wanders with height, so it is never a straight line
       2. thickness is modulated by noise along its length, which is what
          breaks it into beads and detached droplets
       3. it only exists between the head and the top of the frame */
  float wander = (fbm(vec2(uv.y * 4.0 - t * 0.35, t * 0.25)) - 0.5) * 0.30;
  float cx = wander;

  float beads = fbm(vec2(uv.y * 16.0 - t * 2.2, t * 0.6));
  float w = 0.014 + 0.030 * beads;          // varies along the length
  w *= smoothstep(0.0, 0.18, 1.05 - uv.y);  // thins at the very top

  float dx = abs(p.x - cx);
  float stream = exp(-(dx * dx) / (w * w)) * step(head, uv.y);

  /* Trailing wisps peeling off the filament. */
  float wisp = exp(-(dx * dx) / (w * w * 9.0))
             * pow(fbm(vec2(p.x * 9.0, uv.y * 7.0 - t * 1.4)), 3.0) * 2.2
             * step(head, uv.y);

  /* ---- the bloom --------------------------------------------------
     Starts on impact. Radius grows as sqrt(time), which is how a dye
     front actually advances when it is spreading rather than being
     pushed. Density drops as it grows: the same ink, more water. */
  float bt = clamp((t - FALL) / BLOOM, 0.0, 1.0);
  float R  = 0.62 * sqrt(bt);

  vec2 bp = p - vec2(cx, FLOOR);
  bp.y *= 1.9;                                /* squashed: it hit a floor */

  /* Domain warp, amplitude growing with the bloom. This is what turns a
     circle into lobes and curls. Without it this is a spreading disc. */
  vec2 wv = vec2(fbm(bp * 3.0 + vec2(0.0, -t * 0.25)),
                 fbm(bp * 3.0 + vec2(5.7, 2.1) + t * 0.18));
  bp += (wv - 0.5) * (0.34 + 0.55 * bt);

  float d = length(bp);
  float bloom = smoothstep(R, R * 0.15, d) * bt * (1.0 - 0.45 * bt);

  /* Curdled interior, so the cloud has structure instead of being a blob. */
  bloom *= 0.45 + 0.85 * fbm(bp * 5.0 + vec2(0.0, -t * 0.2));

  /* ---- combine and fade ------------------------------------------- */
  float ink = stream + wisp * 0.7 + bloom;
  ink = clamp(ink, 0.0, 1.6);

  float fade = 1.0 - smoothstep(FALL + BLOOM, FALL + BLOOM + FADE, t);
  ink *= fade;

  /* Denser ink reads darker and more saturated, exactly like real dye. */
  vec3 col = mix(uInk, uAccent, smoothstep(0.15, 0.95, ink) * 0.45);
  col += pow(smoothstep(0.7, 1.3, ink), 3.0) * 0.10;

  float alpha = clamp(ink, 0.0, 1.0) * 0.72;
  alpha += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

  outColor = vec4(col, alpha);
}`;

const LOOP = 3.6 + 5.4 + 3.2 + 1.6;   // FALL + BLOOM + FADE + GAP, seconds


export function LiquidHero() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false, alpha: true, premultipliedAlpha: false,
      depth: false, stencil: false, powerPreference: "low-power",
    });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      ink: gl.getUniformLocation(prog, "uInk"),
      accent: gl.getUniformLocation(prog, "uAccent"),
    };

    const root = document.documentElement;
    const rgb = (name: string): [number, number, number] => {
      const v = getComputedStyle(root).getPropertyValue(name).trim();
      const hex = v.match(/^#([0-9a-f]{6})$/i);
      if (hex) {
        const n = parseInt(hex[1], 16);
        return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
      }
      const c = v.match(/(\d+(?:\.\d+)?)/g);
      return c && c.length >= 3 ? [+c[0] / 255, +c[1] / 255, +c[2] / 255] : [1, 1, 1];
    };
    const pushColours = () => {
      gl.uniform3fv(U.ink, rgb("--color-surface-2"));
      gl.uniform3fv(U.accent, rgb("--color-accent"));
    };
    pushColours();
    const themeObs = new MutationObserver(pushColours);
    themeObs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(U.res, canvas.width || 1, canvas.height || 1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0, start = 0, running = false, onScreen = false;

    const frame = (now: number) => {
      /* One clock, wrapped. Every drop is the same animation with the same
         noise, which would be a tell if the loop were short; at fourteen
         seconds with a blank gap in the middle, the repeat is not
         legible. */
      if (!onScreen || document.hidden) { running = false; return; }
      gl.uniform1f(U.time, ((now - start) / 1000) % LOOP);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };

    const run = () => {
      if (running) return;
      running = true;
      canvas.style.opacity = "1";
      if (!start) start = performance.now();
      raf = requestAnimationFrame(frame);
    };

    /* Only while the hero is actually on screen. Scroll past it and the
       loop stops; come back and it picks up where the clock is. */
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) run();
    }, { threshold: 0 });
    io.observe(canvas);

    const onVis = () => { if (!document.hidden && onScreen) run(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); themeObs.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} className="liquid" aria-hidden="true" />;
}
