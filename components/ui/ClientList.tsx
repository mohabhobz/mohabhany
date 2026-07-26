"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { ClampedText } from "@/components/ui/ClampedText";

type Item = {
  name: string;
  logo?: string;
  line?: string;
  place?: string;
  period?: string;
};

/**
 * The freelance list, folded.
 *
 * Eleven entries at full height ran to roughly 2,700px on a phone, and every
 * name in it already appears above as a logo. Four are shown and the rest
 * wait behind a word.
 *
 * The hidden ones are UNMOUNTED, not hidden with CSS. A visitor who never
 * presses the button should not be paying to download logos they will not
 * see, and a search engine reading a list it cannot expand should not be
 * told the page holds eleven clients when it shows four.
 */
export function ClientList({ items, initial = 4 }: { items: Item[]; initial?: number }) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, initial);
  const hidden = items.length - initial;

  return (
    <>
      <ul className="entries">
        {shown.map((c, i) => (
          <Reveal as="li" key={c.name} delay={(i % 3) as 0 | 1 | 2}>
            <div className="entry">
              {/* The column keeps its width with or without a file, so
                  rows stay aligned while logos are still being found. */}
              <div className="entry__mark">
                {c.logo && <img src={c.logo} alt="" />}
              </div>
              <div className="entry__body">
                <p className="t-h3">{c.name}</p>
                {c.line && <ClampedText>{c.line}</ClampedText>}
                <p className="t-label entry__meta">
                  {[c.place, c.period].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>

      {hidden > 0 && (
        <button
          type="button"
          className="t-label list-more"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Show less" : `Show all ${items.length}`}
          <span className="list-more__arrow" aria-hidden="true">↓</span>
        </button>
      )}
    </>
  );
}
