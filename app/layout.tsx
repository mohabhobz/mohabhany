import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "../styles/globals.css";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LoadingProvider } from "@/components/ui/Loading";
import { loadingLabels } from "@/lib/loading-labels";

/* Self-hosted by Next — no network request, no layout shift. */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});
/* No Arabic face. IBM Plex Sans Arabic was loaded here in three weights and
   used by nothing except one demo row on the design system page, so every
   visitor was downloading a script the site does not set. Add it back the day
   there is Arabic content, not before. */

export const metadata: Metadata = {
  /* Without this, Next cannot turn a relative OG image path into the
     absolute URL that LinkedIn and WhatsApp require, and every shared link
     previews with no image at all. */
  metadataBase: new URL("https://mohabhany.com"),
  /* One canonical address. Without it the same page is reachable at the
     apex, at www, and on the vercel.app subdomain, and search engines treat
     those as three sites competing with each other. */
  alternates: { canonical: "/" },
  title: "Hobz — Mohab Hany, Product Designer",
  description:
    "Product and UX designer working across design systems, RTL, and AI-native tools.",
  openGraph: {
    title: "Hobz — Mohab Hany, Product Designer",
    description:
      "Product and UX designer working across design systems, RTL, and AI-native tools.",
    type: "website",
    images: ["/og.jpg"],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

/**
 * Runs before first paint so a visitor who chose light never sees a
 * dark flash (and vice versa). This is the one inline script we allow.
 */
const noFlashTheme = `
(function(){try{
  var t=localStorage.getItem('hobz-theme');
  if(t){document.documentElement.setAttribute('data-theme',t);}
}catch(e){}})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /* Read once, on the server, and handed down as a plain object. The loader
     needs a project name the instant a link is clicked, and a fetch at that
     moment would arrive after the sentence had already started typing. */
  const labels = await loadingLabels();

  return (
    /* suppressHydrationWarning: the theme script below sets data-theme on
       <html> before React hydrates, so this one element legitimately differs
       between server and client. Scoped to <html> only — real mismatches
       anywhere else still surface. */
    <html
      lang="en"
      suppressHydrationWarning
      /* Tells Next this page opts into smooth scrolling, so it disables it
         for the duration of a route change. Without it, Next's scroll-to-top
         is animated and races the new page's layout: the sticky cover
         resolves its height mid-animation and the scroll lands partway down,
         which is why opening a project arrived at the logo instead of the
         top of the page. */
      data-scroll-behavior="smooth"
      className={`${display.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body>
        <LoadingProvider labels={labels}>
          {children}
          <ThemeToggle />
        </LoadingProvider>
      </body>
    </html>
  );
}
