import { Stats } from "@/components/Stats";

const highlights = [
  "Advanced analytics & backtesting on financial products",
  "Enterprise-grade AI solutions",
  "Ensemble models across signal horizons",
];

export function Hero() {
  return (
    <section
      id="top"
      className="overflow-hidden border-b border-border bg-hero-radial"
    >
      <div className="section-shell grid gap-12 py-20 md:py-28 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
        <div className="fade-in-up max-w-3xl">
          <span className="section-label">Deep Beta Technology LLC</span>
          <h1 className="font-heading text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient">
              Advanced Analytics &amp; AI,
            </span>{" "}
            Engineered.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            Deep Beta Technology LLC delivers advanced analytics, rigorous backtesting
            on financial products, and AI solutions to enterprises. Our platform
            combines 13 quantitative ML models across alpha research, risk, and
            execution infrastructure.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#projects"
              className="rounded-full border border-accent bg-accent px-6 py-3 text-center text-sm font-semibold text-background transition hover:bg-highlight"
            >
              Explore Projects
            </a>
            <a
              href="#contact"
              className="rounded-full border border-border px-6 py-3 text-center text-sm font-semibold text-foreground transition hover:border-accent hover:text-highlight"
            >
              Contact Us
            </a>
          </div>
        </div>

        <div className="fade-in panel relative overflow-hidden p-6 shadow-glow sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-highlight to-transparent" />
          <div className="grid gap-4">
            <div className="rounded-2xl border border-accent/30 bg-accent/10 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-highlight">
                Enterprise Mandate
              </p>
              <p className="mt-3 font-heading text-2xl text-foreground">
                Advanced analytics, financial backtesting, and AI solutions
                powering systematic enterprise workflows.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {highlights.map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border bg-background/60 p-5"
                >
                  <div className="text-xs uppercase tracking-[0.24em] text-muted">
                    0{index + 1}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <Stats />
        </div>
      </div>
    </section>
  );
}
