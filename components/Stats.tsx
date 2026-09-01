import { getDict, type Lang } from "@/lib/i18n";

export function Stats({ lang }: { lang: Lang }) {
  const t = getDict(lang);

  return (
    <div className="panel fade-in-up grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
      {t.stats.map((stat) => (
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
