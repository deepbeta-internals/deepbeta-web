import { LANGS, getDict, type Lang } from "@/lib/i18n";

export function Navbar({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const links = [
    { href: "#about", label: t.nav.links.about },
    { href: "#projects", label: t.nav.links.projects },
    { href: "#process", label: t.nav.links.process },
    { href: "#technology", label: t.nav.links.technology },
    { href: "#contact", label: t.nav.links.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="section-shell py-4">
        <div className="flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/50 bg-accent/10 font-heading text-lg font-semibold text-highlight">
              β
            </span>
            <div>
              <div className="font-heading text-lg font-semibold text-foreground">
                Deep Beta Technology LLC
              </div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted">
                {t.nav.tagline}
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <nav
              aria-label="Language"
              className="flex items-center gap-1 rounded-full border border-border bg-surface/70 p-1 text-xs font-medium"
            >
              {LANGS.map((l) => (
                <a
                  key={l.code}
                  href={l.path}
                  aria-current={l.code === lang ? "page" : undefined}
                  className={
                    l.code === lang
                      ? "rounded-full bg-accent px-2.5 py-1 text-background"
                      : "rounded-full px-2.5 py-1 text-muted transition hover:text-highlight"
                  }
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <a
              href="#contact"
              className="hidden rounded-full border border-accent bg-accent px-4 py-2 text-sm font-medium text-background transition hover:bg-highlight sm:block"
            >
              {t.nav.requestAccess}
            </a>
          </div>
        </div>

        <nav className="mt-4 flex gap-3 overflow-x-auto pb-1 text-sm text-muted md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full border border-border bg-surface/70 px-3 py-2 transition hover:border-accent hover:text-highlight"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
