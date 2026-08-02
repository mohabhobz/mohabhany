/* ============================================================
   FILL

   Merges the Arabic content file over the English one.

   The Arabic file carries only words. Everything else, logo paths,
   hrefs, icons, brand colours, stays in one place and is inherited,
   so a logo is never wrong in one language and right in the other,
   and adding a client means touching one file rather than two.

   Arrays are merged by position. The two files describe the same
   list in the same order; that is the contract, and it is checked by
   the length assertion in the loader.
   ============================================================ */

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function fill<T>(base: T, over: unknown): T {
  if (over == null) return base;

  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base;
    /* Positional. An Arabic array shorter than the English one leaves
       the tail in English rather than truncating the list. */
    return base.map((item, i) => fill(item, over[i])) as unknown as T;
  }

  if (isObj(base)) {
    if (!isObj(over)) return base;
    const out: Obj = { ...base };
    for (const key of Object.keys(base)) out[key] = fill((base as Obj)[key], over[key]);
    return out as T;
  }

  /* A leaf. An empty string counts as absent: a field left blank in the
     Arabic file should show the English rather than show nothing. */
  if (typeof over === "string" && over.trim() === "") return base;
  return over as T;
}
