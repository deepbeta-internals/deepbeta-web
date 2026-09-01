import { getDict, type Lang } from "@/lib/i18n";

export function Contact({ lang }: { lang: Lang }) {
  const t = getDict(lang);

  return (
    <section id="contact" className="py-20 md:py-24">
      <div className="section-shell">
        <div className="panel fade-in-up overflow-hidden p-8 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="section-label">{t.contact.label}</span>
              <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                {t.contact.heading}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {t.contact.paragraph}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="mailto:contact@deepbeta.co"
                className="rounded-full border border-accent bg-accent px-6 py-3 text-center text-sm font-semibold text-background transition hover:bg-highlight"
              >
                {t.contact.requestAccess}
              </a>
              <a
                href="mailto:contact@deepbeta.co"
                className="text-center text-sm text-muted transition hover:text-highlight"
              >
                contact@deepbeta.co
              </a>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-background/60 p-5 text-sm leading-7 text-muted">
            {t.contact.disclaimer}
          </div>
        </div>
      </div>
    </section>
  );
}
