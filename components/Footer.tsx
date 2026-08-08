const links = [
  { href: "#projects", label: "Projects" },
  { href: "#research", label: "Research" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
  {
    href: "mailto:contact@deepbeta.co?subject=Privacy%20Policy%20Request",
    label: "Privacy Policy",
  },
  {
    href: "mailto:contact@deepbeta.co?subject=Terms%20Request",
    label: "Terms",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="section-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-heading text-lg font-medium text-foreground">
            Deep Beta Technology LLC
          </div>
          <div className="mt-2 text-sm text-muted">
            © 2025 Deep Beta Technology LLC. All rights reserved.
          </div>
          <div className="mt-1 text-sm text-muted">
            Not financial advice. For qualified investors only.
          </div>
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
