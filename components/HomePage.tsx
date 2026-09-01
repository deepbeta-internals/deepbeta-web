import { About } from "@/components/About";
import { BestModels } from "@/components/BestModels";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { HtmlLang } from "@/components/HtmlLang";
import { Navbar } from "@/components/Navbar";
import { Projects } from "@/components/Projects";
import { TechStack } from "@/components/TechStack";
import type { Lang } from "@/lib/i18n";

export function HomePage({ lang }: { lang: Lang }) {
  return (
    <div className="min-h-screen bg-background">
      <HtmlLang lang={lang} />
      <Navbar lang={lang} />
      <main>
        <Hero lang={lang} />
        <About lang={lang} />
        <Projects lang={lang} />
        <BestModels lang={lang} />
        <HowItWorks lang={lang} />
        <TechStack lang={lang} />
        <Contact lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
