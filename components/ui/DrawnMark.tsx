/**
 * Marks that are drawn rather than loaded.
 *
 * Both of these arrived as images with their own baked-in near-black
 * background, which is fine on a dark page and a black tile on a light one.
 * Redrawn here they take currentColor, so they follow the theme like every
 * other mark, and they cost bytes measured in hundreds rather than megabytes.
 *
 * The Design System Generator geometry was measured off the source image, so
 * this is the same mark and not an interpretation of it.
 */
function Hobz() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 28.5 L28.5 15.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/* Four steps of a token ramp: three solid, the last an outline. */
function Dsg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6.47" cy="12" r="2.51" fill="currentColor" />
      <circle cx="11.58" cy="12" r="1.80" fill="currentColor" />
      <circle cx="15.42" cy="12" r="1.24" fill="currentColor" />
      <circle cx="18.73" cy="12" r="1.10" stroke="currentColor" strokeWidth="0.3" />
    </svg>
  );
}

const MARKS: Record<string, () => React.ReactElement> = { hobz: Hobz, dsg: Dsg };

export function DrawnMark({ name }: { name: string }) {
  const M = MARKS[name];
  if (!M) return null;
  return (
    <span className="drawn-mark" aria-hidden="true">
      <M />
    </span>
  );
}
