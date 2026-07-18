"use client";

import { useState } from "react";

/** Magic-link sign in. Only the owner's inbox can unlock editing. */
export function SignIn({ signIn }: { signIn: (email: string) => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) return <span className="t-label">Check your email for the link</span>;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="t-label"
        style={{ border: "1px solid var(--color-line)", borderRadius: "var(--radius-pill)", padding: "6px 12px" }}>
        Sign in to edit
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => { e.preventDefault(); await signIn(email); setSent(true); }}
      style={{ display: "flex", gap: "var(--space-2)" }}
    >
      <input
        type="email" required autoFocus placeholder="you@email.com"
        value={email} onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "6px 10px", background: "var(--color-bg)", fontSize: 13,
          border: "1px solid var(--color-line)", borderRadius: "var(--radius-sm)", color: "var(--color-ink)",
        }}
      />
      <button type="submit" className="t-label"
        style={{ border: "1px solid var(--color-accent)", color: "var(--color-accent-text)", borderRadius: "var(--radius-pill)", padding: "6px 12px" }}>
        Send link
      </button>
    </form>
  );
}
