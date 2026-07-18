"use client";

import { useState } from "react";

export function Btn({ onClick, children, tone, disabled, title }: {
  onClick: () => void; children: React.ReactNode;
  tone?: "accent" | "danger"; disabled?: boolean; title?: string;
}) {
  const color =
    tone === "accent" ? "var(--color-accent-text)" :
    tone === "danger" ? "#E5484D" : "var(--color-dim)";
  const border =
    tone === "accent" ? "var(--color-accent)" :
    tone === "danger" ? "#E5484D" : "var(--color-line)";
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      aria-disabled={disabled}
      style={{
        fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em",
        textTransform: "uppercase", padding: "6px 12px",
        borderRadius: "var(--radius-pill)", border: `1px solid ${border}`,
        color, background: "transparent", whiteSpace: "nowrap",
        /* A control that cannot act must not look like it can. */
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >{children}</button>
  );
}

/**
 * Two-step delete. Anything holding content asks first, so a stray
 * click can never wipe a section you spent an hour on.
 */
export function DeleteBtn({ onConfirm, label = "Delete", hasContent = true }: {
  onConfirm: () => void; label?: string; hasContent?: boolean;
}) {
  const [armed, setArmed] = useState(false);

  if (!hasContent) return <Btn onClick={onConfirm}>{label}</Btn>;

  if (!armed) return <Btn onClick={() => setArmed(true)} tone="danger">{label}</Btn>;

  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <span className="t-label" style={{ color: "#E5484D" }}>Delete — sure?</span>
      <Btn onClick={onConfirm} tone="danger">Yes, delete</Btn>
      <Btn onClick={() => setArmed(false)}>Cancel</Btn>
    </span>
  );
}

export function Toolbar({ children, className, open }: {
  children: React.ReactNode; className?: string; open?: boolean;
}) {
  return (
    <div className={className} data-open={open ? "true" : undefined} style={{
      display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center",
      marginTop: "var(--space-3)", paddingTop: "var(--space-3)",
      borderTop: "1px dashed var(--color-line)",
    }}>{children}</div>
  );
}

export function Field({ label, value, onChange, mono }: {
  label: string; value: string; onChange: (v: string) => void; mono?: boolean;
}) {
  return (
    <label style={{ display: "block", marginBottom: "var(--space-2)" }}>
      <span className="t-label" style={{ display: "block", marginBottom: 4 }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "8px 10px", background: "var(--color-bg)",
          border: "1px solid var(--color-line)", borderRadius: "var(--radius-sm)",
          color: "var(--color-ink)", font: "inherit", fontSize: 14,
          fontFamily: mono ? "var(--font-mono)" : undefined,
        }}
      />
    </label>
  );
}

/** Inline text you can click and type into. */
export function Editable({ value, onChange, className, placeholder }: {
  value: string; onChange: (v: string) => void; className?: string; placeholder?: string;
}) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      className={className}
      onBlur={(e) => onChange(e.currentTarget.textContent ?? "")}
      style={{
        display: "inline-block", minWidth: 60, outline: "none",
        borderBottom: "1px dashed var(--color-line-strong)",
      }}
    >{value || placeholder || ""}</span>
  );
}
