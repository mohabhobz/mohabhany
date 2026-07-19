import { notFound } from "next/navigation";

/**
 * The studio. Local only.
 *
 * Everything under /projects is the editing surface: the project list, the
 * reordering, and the editor itself. None of it is for visitors, so the
 * whole segment refuses to render outside development.
 *
 * The guard sits on the layout rather than each page because a layout wraps
 * every route in the segment, present and future. A check copied into each
 * page is a check somebody forgets to copy into the next one.
 *
 * This is also why the editor lives here and not on the public page: a
 * route that never renders in production never has its client components
 * bundled either, so the public case study ships no editor JavaScript at
 * all. The guard is a security boundary and a performance one.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <>{children}</>;
}
