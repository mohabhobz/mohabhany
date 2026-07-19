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
uniform float uTime;
uniform float uProgress;   // 0 at the start of the pour, 1 at the end
uniform vec3  uInk;
uniform vec3  uAccent;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.02 + 17.3; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;          // y: 0 bottom, 1 top
  float ar = uRes.x / uRes.y;
  float t  = uTime;

  /* The descent. Fast at first and settling as it runs out of momentum,
     which is what falling liquid does once it stops being a stream and
     starts being a sheet. Stops at 0.28, so it covers roughly the top
     two thirds and never reaches the floor. */
  float e     = 1.0 - pow(1.0 - clamp(uProgress, 0.0, 1.0), 2.6);
  float front = mix(1.06, 0.28, e);

  /* The edge. Two frequencies: a slow swell across the width, and finer
     tongues that run ahead of the main front. Both drift with time so the
     edge keeps moving after the front has settled. */
  float swell  = (fbm(vec2(uv.x * ar * 1.6, t * 0.18)) - 0.5) * 0.10;
  float tongue = pow(fbm(vec2(uv.x * ar * 5.0 + 3.1, t * 0.30)), 2.0) * 0.13;
  float edgeY  = front + swell - tongue;

  /* Softness grows as it slows: a fast front is sharp, a settling one
     spreads. */
  float soft = mix(0.012, 0.055, e);
  float body = smoothstep(edgeY - soft, edgeY + soft, uv.y);

  /* Interior movement, so the filled area is not a flat colour. Warped
     twice and drifting downward at roughly the speed of the pour. */
  vec2  q = vec2(uv.x * ar, uv.y) * 2.2;
  q += vec2(fbm(q + vec2(0.0, -t * 0.55)), fbm(q + vec2(4.7, 1.2)));
  float f = fbm(q + vec2(0.0, -t * 0.35));

  /* Density thins toward the top: the liquid has moved on from there and
     is piling up at the front. */
  float depth = mix(0.35, 1.0, smoothstep(1.05, edgeY, uv.y));

  /* The leading edge carries the accent. It is the only place in the
     frame with any saturation, which is what makes the front read as the
     event rather than the fill. */
  float rim = smoothstep(0.16, 0.0, abs(uv.y - edgeY)) * body;

  vec3 col = uInk * (0.55 + 0.65 * f) * depth;
  col = mix(col, uAccent, rim * 0.55);
  col += pow(smoothstep(0.62, 0.92, f), 5.0) * 0.06 * body;   // wet highlight

  /* In, hold, out. The drain is longer than the arrival because liquid
     leaves more slowly than it lands. */
  float fadeIn  = smoothstep(0.00, 0.06, uProgress);
  float fadeOut = 1.0 - smoothstep(0.66, 1.00, uProgress);
  float alpha   = body * fadeIn * fadeOut * (0.30 + 0.55 * depth);

  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;               // kill banding
  outColor = vec4(col, alpha);
}`;

const DURATION = 7000;   // ms, arrival through to fully drained

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
      prog: gl.getUniformLocation(prog, "uProgress"),
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

    let raf = 0, start = 0, running = false;

    const frame = (now: number) => {
      const p = (now - start) / DURATION;
      gl.uniform1f(U.time, (now - start) / 1000);
      gl.uniform1f(U.prog, p);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (p >= 1) {
        /* Done. Stop the loop and leave the canvas clear. The page costs
           nothing from here on. */
        running = false;
        canvas.style.opacity = "0";
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const pour = () => {
      if (running) return;
      running = true;
      canvas.style.opacity = "1";
      start = performance.now();
      raf = requestAnimationFrame(frame);
    };

    /* Pours when the hero is on screen, and again if you come back to the
       top later. Once per visit, not on a timer. */
    let armed = true;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && armed) { armed = false; pour(); }
      if (!e.isIntersecting) armed = true;
    }, { threshold: 0.5 });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); themeObs.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} className="liquid" aria-hidden="true" />;
}
