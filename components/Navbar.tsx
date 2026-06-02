const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#process", label: "Process" },
  { href: "#technology", label: "Technology" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
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
                Deepbeta.co
              </div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted">
                Quantitative ML Research
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

          <a
            href="#contact"
            className="rounded-full border border-accent bg-accent px-4 py-2 text-sm font-medium text-background transition hover:bg-highlight"
          >
            Request Access
          </a>
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
