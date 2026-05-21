const navigation = [
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Technology", href: "#technology" },
  { label: "Contact", href: "#contact" },
];

const stats = [
  { value: "13", label: "Quant ML Projects" },
  { value: "4", label: "Asset Classes" },
  { value: "200+", label: "Engineered Features" },
  { value: "AI-Driven", label: "Execution" },
];

const projects = [
  {
    name: "Alpha Signal Engine",
    description: "Momentum & mean-reversion detection across timeframes",
  },
  {
    name: "Regime Classifier",
    description: "Market regime identification via Hidden Markov Models",
  },
  {
    name: "Vol Surface Model",
    description: "ML-based options volatility surface fitting & arbitrage",
  },
  {
    name: "Macro Factor Model",
    description: "Multi-factor macro alpha from economic data",
  },
  {
    name: "Order Flow Imbalance",
    description: "High-frequency order book signal extraction",
  },
  {
    name: "Sentiment Fusion",
    description: "NLP-driven news & social sentiment alpha",
  },
  {
    name: "Ensemble Forecaster",
    description: "Stacked model ensemble for return prediction",
  },
  {
    name: "Risk Parity Optimizer",
    description: "ML-enhanced dynamic risk parity allocation",
  },
  {
    name: "Pairs Trader",
    description: "Statistical arbitrage via cointegration & spread modeling",
  },
  {
    name: "Deep Trend Follower",
    description: "LSTM-based long-horizon trend following",
  },
  {
    name: "Event Study Engine",
    description: "Earnings, macro, and corporate event-driven alpha",
  },
  {
    name: "Cross-Asset Correlator",
    description: "Dynamic correlation modeling across asset classes",
  },
  {
    name: "Execution Quality AI",
    description: "Smart order routing and execution optimization",
  },
];

const steps = [
  {
    title: "Step 1 — Data & Features",
    description:
      "Ingest multi-source market data, engineer 200+ alpha features",
  },
  {
    title: "Step 2 — Model Competition",
    description:
      "13 ML models compete; best ensemble selected per regime",
  },
  {
    title: "Step 3 — Execution & Risk",
    description:
      "Live execution with real-time risk controls and audit trail",
  },
];

const technologies = [
  "Python",
  "PyTorch",
  "TensorFlow",
  "XGBoost",
  "QuantLib",
  "pandas",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Kubernetes",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(24,24,26,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <a href="#top" className="font-heading text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Deepbeta <span className="text-[var(--accent-gold)]">β</span>
            </a>
            <a
              href="#contact"
              className="rounded-full border border-[var(--accent-gold)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[rgba(201,168,76,0.14)]"
            >
              Request Access
            </a>
          </div>
          <nav className="flex flex-wrap gap-5 text-sm text-[var(--text-secondary)] md:items-center md:justify-center">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-[var(--text-primary)]">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(240,192,64,0.16),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="max-w-4xl space-y-8">
            <span className="inline-flex items-center rounded-full border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.08)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-yellow)]">
              Deepbeta.co
            </span>
            <div className="space-y-6">
              <h1 className="font-heading text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                Quantitative Intelligence, Engineered.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                Deepbeta.co builds cutting-edge quantitative machine learning systems — 13 production-grade models spanning every major asset class.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#projects"
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent-gold)] px-6 py-3 text-sm font-semibold text-[#1c1608] transition hover:bg-[var(--accent-yellow)]"
              >
                Explore Projects
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent-gold)] hover:bg-[rgba(201,168,76,0.08)]"
              >
                Contact Us
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-[var(--border)] bg-[rgba(36,36,32,0.8)] p-5 shadow-[0_0_0_1px_rgba(201,168,76,0.06)] backdrop-blur sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[rgba(201,168,76,0.08)] bg-[rgba(46,46,40,0.65)] p-5">
                <div className="font-heading text-3xl font-semibold text-[var(--accent-yellow)]">{stat.value}</div>
                <div className="mt-2 text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl rounded-[2rem] border border-[var(--border)] bg-[var(--bg-surface)] p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-yellow)]">About</p>
          <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">What is Deepbeta?</h2>
          <p className="mt-6 text-lg leading-8 text-[var(--text-secondary)]">
            Deepbeta.co is a quantitative research and ML engineering company focused on systematic alpha generation. We engineer rigorous, data-driven models that compete in real markets across equities, crypto, FX, and derivatives.
          </p>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-yellow)]">Projects</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Thirteen production-grade quant ML systems.</h2>
          <p className="text-lg leading-8 text-[var(--text-secondary)]">
            A full research stack covering signal discovery, portfolio construction, and execution intelligence.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <article
              key={project.name}
              className="group rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[rgba(240,192,64,0.6)] hover:shadow-[0_0_30px_rgba(201,168,76,0.14)]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(240,192,64,0.35)] bg-[rgba(201,168,76,0.12)] font-heading text-base font-semibold text-[var(--accent-yellow)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-heading mt-6 text-2xl font-semibold tracking-tight text-[var(--text-primary)] transition group-hover:text-[var(--accent-yellow)]">
                {project.name}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">{project.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-surface)] p-8 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-yellow)]">How It Works</p>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">A disciplined pipeline from raw data to live execution.</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
                <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)]">{step.title}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="technology" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-yellow)]">Technology</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Built with modern quantitative and infrastructure tooling.</h2>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          {technologies.map((technology) => (
            <span
              key={technology}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[rgba(240,192,64,0.45)] hover:text-[var(--text-primary)]"
            >
              {technology}
            </span>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[rgba(201,168,76,0.22)] bg-[linear-gradient(145deg,rgba(46,46,40,0.95),rgba(36,36,32,0.92))] p-8 shadow-[0_0_50px_rgba(201,168,76,0.08)] sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-yellow)]">Contact</p>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Ready to go deeper?</h2>
            <p className="mt-4 text-lg leading-8 text-[var(--text-secondary)]">
              Get in touch with the Deepbeta team for research partnerships, methodology decks, or investor inquiries.
            </p>
            <a href="mailto:contact@deepbeta.mn" className="mt-6 inline-block text-lg font-medium text-[var(--accent-yellow)] transition hover:text-[var(--text-primary)]">
              contact@deepbeta.mn
            </a>
          </div>
          <a
            href="mailto:contact@deepbeta.mn"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--accent-gold)] px-6 py-3 text-sm font-semibold text-[#1c1608] transition hover:bg-[var(--accent-yellow)]"
          >
            Send a Message
          </a>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-[rgba(24,24,26,0.92)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 text-sm text-[var(--text-secondary)] sm:px-6 lg:grid-cols-[1.2fr_1fr_1.4fr] lg:px-8">
          <div>
            <div className="font-heading text-lg font-semibold text-[var(--text-primary)]">
              Deepbeta <span className="text-[var(--accent-gold)]">β</span>
            </div>
            <p className="mt-3">© 2025 Deepbeta.co. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-center">
            {[...navigation, { label: "Privacy Policy", href: "#top" }, { label: "Terms", href: "#top" }].map((item) => (
              <a key={`${item.label}-${item.href}`} href={item.href} className="transition hover:text-[var(--text-primary)]">
                {item.label}
              </a>
            ))}
          </div>
          <p className="max-w-xl leading-6 lg:justify-self-end lg:text-right">
            Not financial advice. For qualified investors only. Past performance is not indicative of future results.
          </p>
        </div>
      </footer>
    </main>
  );
}
