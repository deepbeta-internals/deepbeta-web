export function Contact() {
  return (
    <section id="contact" className="py-20 md:py-24">
      <div className="section-shell">
        <div className="panel fade-in-up overflow-hidden p-8 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="section-label">Get In Touch</span>
              <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                Request access to Deepbeta research and deployment workflows.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                Reach out to discuss partnership opportunities, model access, and
                quantitative research collaboration.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="mailto:contact@deepbeta.co"
                className="rounded-full border border-accent bg-accent px-6 py-3 text-center text-sm font-semibold text-background transition hover:bg-highlight"
              >
                Request Access
              </a>
              <a
                href="mailto:contact@deepbeta.co"
                className="text-center text-sm text-muted transition hover:text-highlight"
              >
                contact@deepbeta.co
              </a>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-background/60 p-5 text-sm leading-7 text-muted">
            Legal disclaimer: Deepbeta.co provides research, software, and
            infrastructure information for informational purposes only. Not
            financial advice. For qualified investors only.
          </div>
        </div>
      </div>
    </section>
  );
}
