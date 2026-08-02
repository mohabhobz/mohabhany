/* The landing page copy. Content is data, same principle as the case
   studies, so the page can be edited without touching JSX. */
export type Site = {
  intro: { eyebrow: string; headline: string; lead: string; note: string };
  clients: { label: string; title: string; note: string; items: { name: string; logo: string }[] };
  work: { label: string; title: string };
  ai: {
    label: string; title: string; note: string;
    items: { name: string; href: string; logo: string; line: string }[];
  };
  career: {
    label: string; title: string;
    roles: { company: string; title: string; period: string; place: string; line: string; logo?: string }[];
  };
  consulting: {
    label: string; title: string; meta?: string; note?: string;
    items: { name: string; place: string; period: string; logo: string; line: string }[];
  };
  contact: { label: string; headline: string; email: string; links: { label: string; href: string; icon?: string; brand?: string }[] };
};
