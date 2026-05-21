const projects = [
  ["Alpha Signal Engine", "Momentum & mean-reversion detection"],
  ["Regime Classifier", "Market regime identification via HMM"],
  ["Vol Surface Model", "Options volatility surface fitting"],
  ["Macro Factor Model", "Multi-factor macro alpha"],
  ["Order Flow Imbalance", "High-frequency order book signals"],
  ["Sentiment Fusion", "NLP-driven sentiment alpha"],
  ["Ensemble Forecaster", "Stacked model ensemble predictions"],
  ["Risk Parity Optimizer", "ML-enhanced risk parity allocation"],
  ["Pairs Trader", "Statistical arbitrage via cointegration"],
  ["Deep Trend Follower", "LSTM-based trend following"],
  ["Event Study Engine", "Earnings/event-driven alpha"],
  ["Cross-Asset Correlator", "Dynamic cross-asset correlation"],
  ["Execution Quality AI", "Smart order routing & execution"],
] as const;

export function Projects() {
  return (
    <section id="projects" className="border-y border-border bg-surface/35 py-20 md:py-24">
      <div className="section-shell">
        <span id="research" className="block h-0 -translate-y-24" aria-hidden />
        <div className="fade-in-up max-w-3xl">
          <span className="section-label">13 Quant ML Projects</span>
          <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            A research suite spanning the full quantitative trading stack.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
            Each project targets a distinct source of edge, from market regime
            detection and feature-rich forecasting to execution intelligence and
            portfolio construction.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map(([title, description], index) => (
            <article
              key={title}
              className="panel group fade-in-up p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-glow"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 font-heading text-sm font-semibold text-highlight">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xs uppercase tracking-[0.24em] text-muted transition group-hover:text-highlight">
                  Project
                </span>
              </div>
              <h3 className="mt-5 font-heading text-2xl font-medium text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
