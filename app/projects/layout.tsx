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
 * KNOWN DEBT: this is a routing boundary, not yet a bundle one. The public
 * case study still imports ProjectCover, ProjectShell and SectionsEditor
 * because those components render both views off an `editing` flag, so the
 * editing branches — upload handlers, buttons, delete confirmations — ship
 * to visitors even though nothing can reach them. Splitting each into a
 * renderer and an editor would fix it. It is dead weight, not a leak.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <>{children}</>;
}
