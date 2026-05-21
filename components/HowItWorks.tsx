const steps = [
  {
    title: "Data Ingestion & Feature Engineering",
    detail:
      "Alternative, macro, price, options, and microstructure data are normalized into 200+ engineered features.",
  },
  {
    title: "Model Selection & Ensemble",
    detail:
      "Thirteen competing algorithms are evaluated, blended, and stress-tested across multiple market regimes.",
  },
  {
    title: "Execution & Risk Management",
    detail:
      "Signals flow into live trading integration with portfolio controls, execution monitoring, and risk overlays.",
  },
];

export function HowItWorks() {
  return (
    <section id="process" className="py-20 md:py-24">
      <div className="section-shell">
        <div className="fade-in-up max-w-3xl">
          <span className="section-label">How It Works</span>
          <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            A three-stage pipeline designed for research velocity and deployment
            discipline.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="panel fade-in-up p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-xs uppercase tracking-[0.24em] text-highlight">
                Step {index + 1}
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
