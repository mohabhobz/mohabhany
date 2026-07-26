"use client";

import { useState } from "react";
import type { Block, BlockKind, Row, RowLayout, Section } from "@/lib/types";
import { BLOCK_LABELS, CELLS_PER_LAYOUT, GRID_FOR_LAYOUT, newBlock, uid } from "@/lib/types";
import { BlockView } from "@/components/blocks/BlockView";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { Btn, DeleteBtn, Editable, Toolbar } from "@/components/editor/ui";
import { Icon, ICON_NAMES, searchIcons, type IconName } from "@/components/ui/Icon";

const LAYOUTS: { id: RowLayout; label: string }[] = [
  { id: "1", label: "Full" }, { id: "1-1", label: "Half" },
  { id: "1-1-1", label: "Thirds" }, { id: "1-1-1-1", label: "Quarters" },
  { id: "2-1", label: "2 / 1" }, { id: "1-2", label: "1 / 2" },
];

/**
 * Change a row's column count after the fact.
 * Growing adds empty cells; shrinking pushes the orphaned blocks into the
 * last surviving cell rather than deleting them — losing content silently
 * because someone clicked a layout button would be unforgivable.
 */
function relayout(row: Row, layout: RowLayout): Row {
  const want = CELLS_PER_LAYOUT[layout];
  const cells = row.cells.slice(0, want);
  while (cells.length < want) cells.push([]);
  if (row.cells.length > want) {
    const orphans = row.cells.slice(want).flat();
    if (orphans.length) cells[want - 1] = [...cells[want - 1], ...orphans];
  }
  return { ...row, layout, cells };
}

/**
 * Move one item of a list one place up or down.
 *
 * Returns the SAME array reference when the move is impossible, so callers can
 * hand the result straight to onChange without checking: React sees no change
 * and nothing re-renders. This is used at all three levels, because the layout
 * nests and reordering has to work at whichever level the eye is on.
 */
function shift<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function blockHasContent(b: Block): boolean {
  const strip = (x: unknown) => JSON.stringify(x).replace(/"id":"[^"]+"/, "");
  return strip(b) !== strip(newBlock(b.kind));
}

/**
 * The section → row → cell → block editor.
 * Shared by the project intro and every case study, so both behave identically.
 */
export function SectionsEditor({ sections, onChange, editing, onUpload, addLabel = "+ Add section" }: {
  sections: Section[];
  onChange: (next: Section[]) => void;
  editing: boolean;
  onUpload: (cb: (url: string) => void) => void;
  addLabel?: string;
}) {
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [openIcon, setOpenIcon] = useState<string | null>(null);
  const [iconQuery, setIconQuery] = useState("");

  const patch = (sid: string, fn: (s: Section) => Section) =>
    onChange(sections.map((s) => (s.id === sid ? fn(s) : s)));

  const move = (sid: string, dir: -1 | 1) =>
    onChange(shift(sections, sections.findIndex((s) => s.id === sid), dir));

  const moveRow = (sid: string, ri: number, dir: -1 | 1) =>
    patch(sid, (x) => ({ ...x, rows: shift(x.rows, ri, dir) }));

  const moveBlock = (sid: string, rid: string, ci: number, bi: number, dir: -1 | 1) =>
    patch(sid, (x) => ({
      ...x,
      rows: x.rows.map((rr) => rr.id !== rid ? rr : {
        ...rr, cells: rr.cells.map((c, i) => i === ci ? shift(c, bi, dir) : c),
      }),
    }));

  return (
    <>
      {sections.map((s, si) => (
        <section key={s.id} className="section">
          <div style={{
            display: "flex", justifyContent: "space-between", gap: "var(--space-4)",
            flexWrap: "wrap", alignItems: "baseline",
          }}>
            {(s.title || editing) && (
              <h2 className="t-section-title">
                {s.icon && ICON_NAMES.includes(s.icon as IconName) && (
                  <span className="section-icon" aria-hidden="true">
                    <Icon name={s.icon as IconName} size={38} />
                  </span>
                )}
                {editing
                  ? <Editable value={s.title ?? ""} onChange={(v) => patch(s.id, (x) => ({ ...x, title: v }))} placeholder="Section title (leave blank for none)" />
                  : s.title}
              </h2>
            )}
            {editing && (
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <Btn
                  onClick={() => move(s.id, -1)}
                  disabled={si === 0}
                  title={si === 0 ? "Already first" : "Move up"}
                >↑</Btn>
                <Btn
                  onClick={() => move(s.id, 1)}
                  disabled={si === sections.length - 1}
                  title={si === sections.length - 1 ? "Already last" : "Move down"}
                >↓</Btn>
                <Btn onClick={() => { setIconQuery(""); setOpenIcon(openIcon === s.id ? null : s.id); }}>
                  {s.icon ? "Icon" : "+ Icon"}
                </Btn>
                <DeleteBtn label="Delete section"
                  hasContent={s.rows.some((r) => r.cells.some((c) => c.length > 0))}
                  onConfirm={() => onChange(sections.filter((x) => x.id !== s.id))} />
              </div>
            )}
          </div>

          {editing && openIcon === s.id && (() => {
            /* Search by name or meaning: "warning" finds problem, "spark"
               finds ai. searchIcons owns the matching so this stays a view. */
            const matches = searchIcons(iconQuery);
            return (
              <div style={{
                marginTop: "var(--space-4)", padding: "var(--space-4)",
                border: "1px solid var(--color-line)",
                borderRadius: "var(--radius-md)", background: "var(--color-surface)",
              }}>
                <input
                  autoFocus
                  value={iconQuery}
                  onChange={(e) => setIconQuery(e.target.value)}
                  placeholder="Search icons: lock, growth, ai, government..."
                  style={{
                    width: "100%", padding: "8px 10px", marginBottom: "var(--space-3)",
                    background: "var(--color-bg)", border: "1px solid var(--color-line)",
                    borderRadius: "var(--radius-sm)", color: "var(--color-ink)",
                    font: "inherit", fontSize: 14,
                  }}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" }}>
                  {matches.map((n) => (
                    <button
                      key={n}
                      title={n}
                      onClick={() => patch(s.id, (x) => ({ ...x, icon: n }))}
                      style={{
                        width: 44, height: 44, display: "grid", placeItems: "center",
                        borderRadius: "var(--radius-sm)",
                        border: `1px solid ${s.icon === n ? "var(--color-accent)" : "var(--color-line)"}`,
                        color: s.icon === n ? "var(--color-accent-text)" : "var(--color-muted)",
                      }}
                    >
                      <Icon name={n} size={20} />
                    </button>
                  ))}
                  {matches.length === 0 && (
                    <span className="t-label" style={{ opacity: .6 }}>
                      No icon for &ldquo;{iconQuery}&rdquo;
                    </span>
                  )}
                  {s.icon && (
                    <Btn onClick={() => patch(s.id, (x) => ({ ...x, icon: undefined }))}>No icon</Btn>
                  )}
                </div>
              </div>
            );
          })()}

          {s.rows.map((r, ri) => (
            <div key={r.id} className="ed-row" style={{ marginTop: "var(--space-8)" }}>
              {/* The column split rides on a custom property, not on
                  grid-template-columns directly. An inline
                  grid-template-columns cannot be overridden by a media query,
                  which is why every multi-column row stayed multi-column on a
                  phone and squeezed body text into a 90px stripe. */}
              <div className="row-grid" data-layout={r.layout}
                   style={{ ["--cols" as string]: GRID_FOR_LAYOUT[r.layout] }}>
                {r.cells.map((cell, ci) => (
                  <div key={ci} className={editing ? "ed-cell" : undefined} style={{
                    minHeight: editing ? 72 : undefined,
                    padding: editing ? "var(--space-4)" : undefined,
                  }}>
                    {cell.map((b, bi) => (
                      <div key={b.id} className={editing ? "ed-block" : undefined}
                           style={{ marginBottom: "var(--space-4)" }}>
                        <BlockView block={b} />
                        {editing && (
                          <>
                            <Toolbar className="ed-tools" open={openBlock === b.id}>
                              {/* Within this cell only. A block cannot jump to
                                  another column: that is a layout decision, and
                                  the row bar below is where layout lives. */}
                              <Btn onClick={() => moveBlock(s.id, r.id, ci, bi, -1)}
                                   disabled={bi === 0}
                                   title={bi === 0 ? "Already first in this cell" : "Move block up"}>↑</Btn>
                              <Btn onClick={() => moveBlock(s.id, r.id, ci, bi, 1)}
                                   disabled={bi === cell.length - 1}
                                   title={bi === cell.length - 1 ? "Already last in this cell" : "Move block down"}>↓</Btn>
                              <Btn onClick={() => setOpenBlock(openBlock === b.id ? null : b.id)}>
                                {openBlock === b.id ? "Close" : `Edit ${BLOCK_LABELS[b.kind]}`}
                              </Btn>
                              <DeleteBtn label="Delete block" hasContent={blockHasContent(b)}
                                onConfirm={() => patch(s.id, (x) => ({
                                  ...x, rows: x.rows.map((rr) => rr.id !== r.id ? rr : {
                                    ...rr, cells: rr.cells.map((c, i) => i === ci ? c.filter((y) => y.id !== b.id) : c),
                                  }),
                                }))} />
                            </Toolbar>
                            {openBlock === b.id && (
                              <div style={{
                                marginTop: "var(--space-3)", padding: "var(--space-4)",
                                background: "var(--color-surface)", borderRadius: "var(--radius-md)",
                                border: "1px solid var(--color-line)",
                              }}>
                                <BlockEditor block={b} onUpload={onUpload}
                                  onChange={(nb) => patch(s.id, (x) => ({
                                    ...x, rows: x.rows.map((rr) => rr.id !== r.id ? rr : {
                                      ...rr, cells: rr.cells.map((c, i) => i === ci ? c.map((y) => y.id === nb.id ? nb : y) : c),
                                    }),
                                  }))} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}

                    {editing && (
                      <details>
                        <summary className="t-label" style={{ cursor: "pointer" }}>+ Add block</summary>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "var(--space-3)" }}>
                          {(Object.keys(BLOCK_LABELS) as BlockKind[]).map((k) => (
                            <Btn key={k} onClick={() => patch(s.id, (x) => ({
                              ...x, rows: x.rows.map((rr) => rr.id !== r.id ? rr : {
                                ...rr, cells: rr.cells.map((c, i) => i === ci ? [...c, newBlock(k)] : c),
                              }),
                            }))}>{BLOCK_LABELS[k]}</Btn>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>

              {editing && (
                <div className="ed-rowbar" data-open={openRow === r.id}
                     style={{
                       display: "flex", gap: "var(--space-2)", flexWrap: "wrap",
                       alignItems: "center", marginTop: "var(--space-3)",
                     }}>
                  {/* Outside the openRow toggle on purpose. Reordering is the
                      thing done most while writing, and burying it behind a
                      second click makes rearranging a long page tedious. */}
                  <Btn onClick={() => moveRow(s.id, ri, -1)}
                       disabled={ri === 0}
                       title={ri === 0 ? "Already first in this section" : "Move row up"}>↑</Btn>
                  <Btn onClick={() => moveRow(s.id, ri, 1)}
                       disabled={ri === s.rows.length - 1}
                       title={ri === s.rows.length - 1 ? "Already last in this section" : "Move row down"}>↓</Btn>
                  <Btn onClick={() => setOpenRow(openRow === r.id ? null : r.id)}>
                    {openRow === r.id ? "Close row" : `Row · ${LAYOUTS.find((l) => l.id === r.layout)?.label ?? ""}`}
                  </Btn>
                  {openRow === r.id && (
                    <>
                      {LAYOUTS.map((l) => (
                        <Btn
                          key={l.id}
                          tone={r.layout === l.id ? "accent" : undefined}
                          disabled={r.layout === l.id}
                          title={r.layout === l.id ? "Current layout" : `Switch to ${l.label}`}
                          onClick={() => patch(s.id, (x) => ({
                            ...x, rows: x.rows.map((rr) => rr.id === r.id ? relayout(rr, l.id) : rr),
                          }))}
                        >{l.label}</Btn>
                      ))}
                      <DeleteBtn label="Delete row" hasContent={r.cells.some((c) => c.length > 0)}
                        onConfirm={() => patch(s.id, (x) => ({ ...x, rows: x.rows.filter((rr) => rr.id !== r.id) }))} />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {editing && (
            <Toolbar>
              <span className="t-label">+ Row:</span>
              {LAYOUTS.map((l) => (
                <Btn key={l.id} onClick={() => patch(s.id, (x) => ({
                  ...x,
                  rows: [...x.rows, { id: uid(), layout: l.id, cells: Array.from({ length: CELLS_PER_LAYOUT[l.id] }, () => []) }],
                }))}>{l.label}</Btn>
              ))}
            </Toolbar>
          )}
        </section>
      ))}

      {editing && (
        <div style={{ marginTop: "var(--space-8)" }}>
          <Btn tone="accent" onClick={() => onChange([...sections, { id: uid(), title: "", rows: [] }])}>
            {addLabel}
          </Btn>
        </div>
      )}
    </>
  );
}
