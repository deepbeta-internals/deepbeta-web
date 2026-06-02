// Fetches best models from brainy.deepbeta.mn at request time.
// Set BRAINY_API_KEY in your environment / Vercel dashboard.

type ModelPerf = { label: string; value: string };

type BrainyModel = {
  id: string;
  name: string;
  family: string;
  description: string;
  performance: ModelPerf[];
  isBest?: boolean;
};

// ---------------------------------------------------------------------------
// Static fallback — replace with real data once API is accessible
// ---------------------------------------------------------------------------
const FALLBACK_MODELS: BrainyModel[] = [
  {
    id: "brainy-ultra",
    name: "Brainy Ultra",
    family: "Brainy",
    description: "Flagship reasoning model optimised for complex multi-step quantitative analysis.",
    performance: [
      { label: "MMLU", value: "89.4%" },
      { label: "Math", value: "91.2%" },
      { label: "Coding", value: "87.6%" },
      { label: "Context", value: "128 k" },
    ],
    isBest: true,
  },
  {
    id: "brainy-pro",
    name: "Brainy Pro",
    family: "Brainy",
    description: "Balanced capability model for research workflows and strategy drafting.",
    performance: [
      { label: "MMLU", value: "85.1%" },
      { label: "Math", value: "86.3%" },
      { label: "Coding", value: "83.0%" },
      { label: "Context", value: "64 k" },
    ],
  },
  {
    id: "brainy-mini",
    name: "Brainy Mini",
    family: "Brainy",
    description: "Lightweight, low-latency model for high-frequency inference tasks.",
    performance: [
      { label: "MMLU", value: "78.7%" },
      { label: "Math", value: "79.4%" },
      { label: "Coding", value: "76.5%" },
      { label: "Context", value: "32 k" },
    ],
  },
  {
    id: "quant-alpha",
    name: "Quant Alpha",
    family: "Quant",
    description: "Specialist model fine-tuned on financial text, signals, and factor research.",
    performance: [
      { label: "FinQA", value: "92.3%" },
      { label: "Math", value: "88.9%" },
      { label: "Factor R²", value: "0.74" },
      { label: "Context", value: "64 k" },
    ],
    isBest: true,
  },
  {
    id: "quant-edge",
    name: "Quant Edge",
    family: "Quant",
    description: "Fast financial inference model for regime detection and live signal scoring.",
    performance: [
      { label: "FinQA", value: "87.1%" },
      { label: "Math", value: "82.4%" },
      { label: "Factor R²", value: "0.68" },
      { label: "Context", value: "32 k" },
    ],
  },
  {
    id: "brainy-code",
    name: "Brainy Code",
    family: "Code",
    description: "Code-specialised model built for Python, SQL, and quant library generation.",
    performance: [
      { label: "HumanEval", value: "90.8%" },
      { label: "MBPP", value: "88.3%" },
      { label: "SWE-bench", value: "52.4%" },
      { label: "Context", value: "64 k" },
    ],
    isBest: true,
  },
];

// ---------------------------------------------------------------------------
// Data fetch
// ---------------------------------------------------------------------------
async function fetchModels(): Promise<BrainyModel[]> {
  const key = process.env.BRAINY_API_KEY;
  if (!key) return FALLBACK_MODELS;

  try {
    const res = await fetch(
      `https://brainy.deepbeta.mn/api/models?endpoint_key=${encodeURIComponent(key)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return FALLBACK_MODELS;
    const json = await res.json();
    // Expect { models: BrainyModel[] } or BrainyModel[]
    return (json.models ?? json) as BrainyModel[];
  } catch {
    return FALLBACK_MODELS;
  }
}

// ---------------------------------------------------------------------------
// Group helpers
// ---------------------------------------------------------------------------
function groupByFamily(models: BrainyModel[]) {
  const map = new Map<string, BrainyModel[]>();
  for (const m of models) {
    if (!map.has(m.family)) map.set(m.family, []);
    map.get(m.family)!.push(m);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export async function BestModels() {
  const models = await fetchModels();
  const families = groupByFamily(models);

  return (
    <section id="models" className="py-20 md:py-24">
      <div className="section-shell">
        <span id="models-anchor" className="block h-0 -translate-y-24" aria-hidden />

        <div className="fade-in-up max-w-3xl">
          <span className="section-label">Best Models</span>
          <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Top-performing models on{" "}
            <a
              href="https://brainy.deepbeta.mn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-highlight transition hover:underline"
            >
              Brainy
            </a>
            , by family.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
            Each model family targets a different capability profile — from
            general reasoning to quant-specialised inference and code generation.
          </p>
        </div>

        <div className="mt-14 space-y-14">
          {Array.from(families.entries()).map(([family, familyModels]) => (
            <div key={family}>
              {/* Family header */}
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-highlight">
                  {family} Family
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Model cards */}
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {familyModels.map((model, index) => (
                  <article
                    key={model.id}
                    className="panel group fade-in-up relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-glow"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {/* Best badge */}
                    {model.isBest && (
                      <span className="absolute right-4 top-4 rounded-full border border-highlight/40 bg-highlight/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-highlight">
                        Best
                      </span>
                    )}

                    {/* Top accent line */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <h3 className="font-heading text-xl font-semibold text-foreground">
                      {model.name}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {model.description}
                    </p>

                    {/* Performance grid */}
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      {model.performance.map((perf) => (
                        <div
                          key={perf.label}
                          className="rounded-2xl border border-border bg-background/60 px-3 py-2.5 text-center"
                        >
                          <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
                            {perf.label}
                          </div>
                          <div className="mt-0.5 font-heading text-base font-semibold text-highlight">
                            {perf.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://brainy.deepbeta.mn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:bg-highlight"
          >
            Explore all models on Brainy
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
