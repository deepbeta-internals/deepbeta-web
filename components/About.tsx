const pillars = [
  "Advanced analytics and AI engineering for systematic enterprise strategies",
  "Backtesting on financial products backed by rigorous walk-forward validation",
  "Ensemble methods and AI solutions built to adapt across asset classes and market regimes",
];

export function About() {
  return (
    <section id="about" className="py-20 md:py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="fade-in-up">
          <span className="section-label">About</span>
          <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            An advanced analytics and AI partner built for systematic enterprise edge.
          </h2>
          <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
            Deep Beta Technology LLC is a technology firm delivering advanced analytics,
            backtesting on financial products, and AI solutions to enterprises.
            The platform is designed around disciplined data handling, robust
            feature engineering, and portfolio-aware model deployment.
          </p>
        </div>

        <div className="grid gap-4">
          {pillars.map((pillar, index) => (
            <div
              key={pillar}
              className="panel fade-in-up flex gap-4 p-6"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 font-heading text-lg text-highlight">
                {index + 1}
              </div>
              <p className="text-sm leading-7 text-foreground sm:text-base">
                {pillar}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
