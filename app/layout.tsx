import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../styles/globals.css";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hobz — Mohab Hany, Product Designer",
  description:
    "Product and UX designer working across design systems, RTL, and AI-native tools.",
  openGraph: {
    title: "Hobz — Mohab Hany, Product Designer",
    description:
      "Product and UX designer working across design systems, RTL, and AI-native tools.",
    type: "website",
  },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning: the theme script below sets data-theme on
       <html> before React hydrates, so this one element legitimately differs
       between server and client. Scoped to <html> only — real mismatches
       anywhere else still surface. */
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${mono.variable} ${arabic.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
