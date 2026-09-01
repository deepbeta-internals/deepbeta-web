import { getDict, type Lang } from "@/lib/i18n";

export function Footer({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const links = [
    { href: "#projects", label: t.footer.links.projects },
    { href: "#research", label: t.footer.links.research },
    { href: "#about", label: t.footer.links.about },
    { href: "#contact", label: t.footer.links.contact },
    {
      href: "mailto:contact@deepbeta.co?subject=Privacy%20Policy%20Request",
      label: t.footer.links.privacy,
    },
    {
      href: "mailto:contact@deepbeta.co?subject=Terms%20Request",
      label: t.footer.links.terms,
    },
  ];

  return (
    <footer className="border-t border-border py-8">
      <div className="section-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-heading text-lg font-medium text-foreground">
            Deep Beta Technology LLC
          </div>
          <div className="mt-2 text-sm text-muted">{t.footer.rights}</div>
          <div className="mt-1 text-sm text-muted">{t.footer.businessModel}</div>
          <div className="mt-1 text-sm text-muted">{t.footer.disclaimer}</div>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition hover:text-highlight"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
