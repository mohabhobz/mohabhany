"use client";

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from "react";
import { usePathname } from "next/navigation";

/**
 * The loading screen, and the readiness signal the rest of the site reads.
 *
 * Four rules shape this, in order of how much they matter:
 *
 * 1. It is an OVERLAY, never a gate. The page renders underneath it, server
 *    side, in the same HTML it would have had otherwise. A loader that returns
 *    null until it is done would hide the whole portfolio from crawlers and
 *    from anyone whose JavaScript failed, which is a high price for an
 *    animation. Cover the content; do not withhold it.
 *
 * 2. There is a hard ceiling on WAITING. However slow the network is, the
 *    overlay stops waiting for assets after CEILING and lets the visitor in.
 *
 * 3. There is a floor on SHOWING: one full sentence, its dots, and a beat
 *    afterwards. Anything shorter and the message cannot be read, which
 *    defeats the point of writing a message at all.
 *
 * The floor is a duration we choose and the ceiling is a duration we endure,
 * so they are computed separately and the longer one wins. Hard-coding a
 * ceiling below the floor would silently cut the sentence in half, which is
 * why CEILING is never used raw.
 */

const TYPE_MS   = 48;    // per character
const DOT_MS    = 260;   // per dot
const HOLD_MS   = 1000;  // the beat after the dots, before anything repeats
const CEILING   = 2600;  // longest we will WAIT on assets

/* The beat after the third dot. Long enough that the finished sentence is
   seen as finished, short enough that it is not a pause. */
const SETTLE_MS = 240;

/**
 * The minimum the overlay stays up, and the only rule that decides it: the
 * sentence must be typed in full, get its three dots, and settle. However
 * fast the page is ready, it waits for that.
 *
 * Derived from the message rather than a fixed number, because the message
 * is built from the project name and a longer name needs longer to type. A
 * constant would either cut "Loading Rasid Case Study" off mid-word or make
 * every short sentence sit there after it had finished.
 *
 * It is a duration, not a "the typewriter told us it finished" signal, so it
 * holds under prefers-reduced-motion too, where the sentence appears at once
 * and there is nothing to report.
 */
const floorFor = (msg: string) => msg.length * TYPE_MS + 3 * DOT_MS + SETTLE_MS;

const ReadyContext = createContext(true);

/**
 * True once the loading screen has finished. Anything that should not start
 * behind the overlay reads this: the cover video is the reason it exists,
 * since a video playing to nobody wastes both bandwidth and the opening shot.
 */
export function useSiteReady() {
  return useContext(ReadyContext);
}

/** slug of a case study → the sentence to show while it opens. */
export type LoadingLabels = Record<string, string>;

/**
 * Types the sentence, adds three dots, holds, and starts again if the page is
 * still loading. onCycle is optional and fires once on the first full cycle;
 * gating no longer depends on it (a time floor does), it is left as a hook.
 */
function Typewriter({ message, onCycle }: { message: string; onCycle?: () => void }) {
  const [n, setN] = useState(0);
  const [dots, setDots] = useState(0);
  const fired = useRef(false);

  /* Restart cleanly when the route changes the sentence mid-flight. */
  useEffect(() => { setN(0); setDots(0); fired.current = false; }, [message]);

  useEffect(() => {
    /* Reduced motion gets the sentence, not the performance. The point is to
       say "this is working", and a static line says it just as well. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(message.length); setDots(3);
      if (!fired.current) { fired.current = true; onCycle?.(); }
      return;
    }

    if (n < message.length) {
      const t = setTimeout(() => setN(n + 1), TYPE_MS);
      return () => clearTimeout(t);
    }
    if (dots < 3) {
      const t = setTimeout(() => setDots(dots + 1), DOT_MS);
      return () => clearTimeout(t);
    }
    /* Sentence and dots are done. Hold, report the cycle, then start over.
       If the provider has already let the visitor through, this component is
       unmounting anyway and the timer is cleaned up below. */
    const t = setTimeout(() => {
      if (!fired.current) { fired.current = true; onCycle?.(); }
      setN(0); setDots(0);
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [n, dots, message, onCycle]);

  /* The full sentence is rendered invisibly underneath to hold the width.
     Without it a centred line grows from the middle outwards and the whole
     sentence slides left one character at a time, which reads as a glitch.
     The sizer reserves the final width up front so the text grows rightwards
     from a fixed start, the way typing actually looks. */
  return (
    <span className="loading__word">
      <span className="loading__sizer" aria-hidden="true">{message}...</span>
      <span className="loading__typed">
        {message.slice(0, n)}
        {n === message.length && ".".repeat(dots)}
        <span className="loading__caret" aria-hidden="true" />
      </span>
    </span>
  );
}

export function LoadingProvider({ labels = {}, children }: {
  labels?: LoadingLabels;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const first = useRef(true);

  /* Where a click is taking us, set the instant the link is pressed and
     cleared once the route actually arrives. This is what lets the overlay
     cover the CURRENT page before the next one paints: without it, the
     overlay only reacts after the navigation has already rendered, so the
     new page flashes for a frame before the loader appears over it. */
  const [navPath, setNavPath] = useState<string | null>(null);
  /* Bumped on every load (first paint and each navigation). Used as the
     Typewriter's key so it always remounts and replays, even when two
     consecutive destinations share the same sentence. Without it, moving
     between two projects with an identical label would leave the sentence
     already "done" and the overlay would never lift. */
  const [runId, setRunId] = useState(0);

  /* The sentence for wherever we are heading. Prefer the click target over
     the current pathname, so the right project name is typed from the first
     frame rather than after the route settles. A slug with no entry falls
     back to the plain word rather than inventing a name for a project. */
  const messageFor = useCallback((path: string) => {
    const s = path.startsWith("/case-study/") ? path.split("/")[2] : "";
    return (s && labels[s]) || "Loading";
  }, [labels]);

  const target = navPath ?? pathname;
  const message = messageFor(target);

  /* Two independent gates. The overlay lifts when BOTH are satisfied: the
     assets have arrived (or we gave up waiting), and the sentence has been
     shown once in full. Tracking them separately is what lets a long project
     name extend the loader without also extending how long we wait on a
     slow network. */
  const [assetsDone, setAssetsDone] = useState(false);
  /* The time floor. Set false when the overlay is raised, flipped true by a
     timer. Replaces the old "the sentence finished" gate, which failed under
     reduced motion because the sentence finished immediately. */
  const [floorDone, setFloorDone] = useState(false);

  /* Starts the floor timer and is called from every place the overlay is
     raised (first paint, each navigation), so the minimum-visible rule lives
     in exactly one function. */
  const startFloor = useCallback((ms: number) => {
    setFloorDone(false);
    const t = setTimeout(() => setFloorDone(true), ms);
    return () => clearTimeout(t);
  }, []);

  /* Raise the overlay on the CLICK, not on the route change. A capture-phase
     listener runs before Next begins the navigation, so the loader is already
     covering the page by the time the next route starts to render. Only
     plain left-clicks on same-origin links that actually change the path
     qualify: modified clicks (new tab), external links, hashes and downloads
     are left to the browser. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
      let dest: URL;
      try { dest = new URL(href, window.location.href); } catch { return; }
      if (dest.origin !== window.location.origin) return;                 // external
      if (dest.pathname === window.location.pathname) return;             // same page or hash
      setNavPath(dest.pathname);
      setReady(false);
      setAssetsDone(true);   // a route change has no load event to wait for
      /* The floor is the destination's own sentence, measured here rather
         than read from state: setNavPath has not committed yet, so `message`
         still describes the page being left. */
      startFloor(floorFor(messageFor(dest.pathname)));
      setRunId((n) => n + 1);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [messageFor, startFloor]);

  useEffect(() => {
    /* Arrival. Clear the pending target so the message follows the real
       pathname again; the overlay is lifted by the ready effect once the
       sentence has completed its cycle. */
    if (navPath && pathname === navPath) setNavPath(null);
  }, [pathname, navPath]);

  useEffect(() => {
    /* First paint only. Route changes are handled by the click listener
       above, so this effect no longer runs its body for them. */
    if (!first.current) return;
    first.current = false;
    setReady(false);
    setAssetsDone(false);
    const clearFloor = startFloor(floorFor(message));

    /* Wait on the two things that actually cause a visible mess: webfonts
       swapping mid-read, and images still arriving. Both are raced against
       CEILING because document.fonts can hang on a flaky connection, and
       `load` never fires at all if a single asset stalls. */
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const loaded = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));

    const done = () => setAssetsDone(true);
    /* Never below the floor. CEILING is how long we are willing to WAIT on a
       slow network; if the sentence takes longer than that to type, giving up
       on assets early changes nothing, and a raw 2600 here would have been
       the shorter of the two gates only by accident. */
    const ceiling = setTimeout(done, Math.max(CEILING, floorFor(message)));
    Promise.all([fonts, loaded]).then(done);
    return () => { clearTimeout(ceiling); clearFloor(); };
  }, [startFloor, message]);

  useEffect(() => {
    if (assetsDone && floorDone) setReady(true);
  }, [assetsDone, floorDone]);

  return (
    <ReadyContext.Provider value={ready}>
      {children}
      {/* aria-hidden because the real content is present underneath and is
          what a screen reader should be reading. Announcing "Loading" over a
          page that is already in the DOM would be noise. */}
      <div className="loading" data-done={ready} aria-hidden="true">
        {!ready && <Typewriter key={runId} message={message} />}
      </div>
    </ReadyContext.Provider>
  );
}
