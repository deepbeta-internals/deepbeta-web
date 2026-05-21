const technologies = [
  "Python",
  "TensorFlow",
  "PyTorch",
  "XGBoost",
  "QuantLib",
  "pandas",
  "PostgreSQL",
  "Redis",
  "Docker",
];

export function TechStack() {
  return (
    <section id="technology" className="border-y border-border bg-surface/35 py-20 md:py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="fade-in-up">
          <span className="section-label">Technology Stack</span>
          <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Purpose-built infrastructure for quantitative machine learning.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
            The stack combines research tooling, model training frameworks, data
            services, and production packaging for repeatable quantitative
            workflows.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech, index) => (
            <div
              key={tech}
              className="panel fade-in-up px-5 py-6 text-center font-heading text-xl text-foreground"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
