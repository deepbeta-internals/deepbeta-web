const stats = [
  "13 Quant ML Projects",
  "4 Asset Classes",
  "200+ Features Engineered",
  "AI-Driven",
];

export function Stats() {
  return (
    <div className="panel fade-in-up grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
      {stats.map((stat) => (
        <div
          key={stat}
          className="rounded-2xl border border-border bg-background/60 px-4 py-4 text-center text-sm font-medium text-foreground sm:text-left"
        >
          {stat}
        </div>
      ))}
    </div>
  );
}
