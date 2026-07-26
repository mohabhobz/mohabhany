import type { MetadataRoute } from "next";

/* The studio is not for crawlers. Everything else is.
   /projects 404s in production anyway; this stops it being requested. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/projects" },
    sitemap: "https://mohabhany.com/sitemap.xml",
  };
}
