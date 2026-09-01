import { getDict, type Lang } from "@/lib/i18n";

export function HowItWorks({ lang }: { lang: Lang }) {
  const t = getDict(lang);

  return (
    <section id="process" className="py-20 md:py-24">
      <div className="section-shell">
        <div className="fade-in-up max-w-3xl">
          <span className="section-label">{t.process.label}</span>
          <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            {t.process.heading}
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {t.process.steps.map((step, index) => (
            <div
              key={step.title}
              className="panel fade-in-up p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-xs uppercase tracking-[0.24em] text-highlight">
                {t.process.stepTemplate.replace("{n}", String(index + 1))}
              </div>
              <h3 className="mt-4 font-heading text-2xl font-medium text-foreground">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
