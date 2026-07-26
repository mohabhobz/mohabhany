"use client";

import { useEffect } from "react";

/**
 * Reads the cover the mark sits on and publishes `data-cover="light" | "dark"`
 * on <html>, so the wordmark can take the opposite of whatever is behind it.
 * Cleared the moment the cover is no longer active (scrolled past), so the
 * mark returns to the theme's own ink: white on black in dark, black on white
 * in light.
 *
 * Samples the ON-SCREEN element directly rather than a separate probe image.
 * The earlier version loaded a second copy with crossOrigin="anonymous", which
 * forces a CORS fetch that can fail even for a same-origin file depending on
 * how the server serves it, and that silent failure was why the mark stopped
 * adapting. Same-origin covers (the /uploads path) do not taint the canvas, so
 * the element itself can be read directly. A cross-origin host without CORS
 * throws on read, which is caught and leaves the mark on the theme ink.
 *
 * Works for both stills and video: a still is read once when it loads, a video
 * is resampled a few times a second while it is the active cover, since its
 * brightness changes as it plays.
 */

/* Rec. 709 luma. Not a plain average: the eye reads green as far brighter than
   blue, so an unweighted mean calls a saturated colour the wrong tone. */
const luma = (r: number, g: number, b: number) =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const MIDPOINT = 0.55;   // above: light cover -> dark mark. below: dark -> light.
const EVERY_MS = 300;    // video resample cadence

export function useCoverInk(
  media: React.RefObject<HTMLImageElement | HTMLVideoElement | null>,
  active: boolean,
) {
  useEffect(() => {
    const root = document.documentElement;
    const clear = () => root.removeAttribute("data-cover");

    if (!active) { clear(); return; }
    const el = media.current;
    if (!el) { clear(); return; }

    const canvas = document.createElement("canvas");
    canvas.width = 24; canvas.height = 12;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { clear(); return; }

    let raf = 0, last = 0, dead = false;

    const isVideo = el.tagName === "VIDEO";
    const dims = () => isVideo
      ? [(el as HTMLVideoElement).videoWidth, (el as HTMLVideoElement).videoHeight]
      : [(el as HTMLImageElement).naturalWidth, (el as HTMLImageElement).naturalHeight];

    const sampleOnce = () => {
      const [w, h] = dims();
      if (!w || !h) return false;
      try {
        /* The top-left corner, where the mark sits. */
        ctx.drawImage(el, 0, 0, w * 0.28, h * 0.16, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) sum += luma(data[i], data[i + 1], data[i + 2]);
        const avg = sum / (data.length / 4);
        root.setAttribute("data-cover", avg > MIDPOINT ? "light" : "dark");
        return true;
      } catch {
        /* Tainted canvas (cross-origin host without CORS). Give up quietly and
           leave the mark on the theme ink. */
        dead = true; clear(); return true;
      }
    };

    if (isVideo) {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (dead || now - last < EVERY_MS) return;
        last = now;
        sampleOnce();
      };
      raf = requestAnimationFrame(loop);
      return () => { cancelAnimationFrame(raf); clear(); };
    }

    /* Still image: read once, now if it is already decoded, otherwise on load. */
    if (!sampleOnce()) {
      const onLoad = () => sampleOnce();
      el.addEventListener("load", onLoad, { once: true });
      return () => { el.removeEventListener("load", onLoad); clear(); };
    }
    return () => clear();
  }, [media, active]);
}
