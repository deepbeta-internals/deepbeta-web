import { About } from "@/components/About";
import { BestModels } from "@/components/BestModels";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { Projects } from "@/components/Projects";
import { TechStack } from "@/components/TechStack";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <BestModels />
        <HowItWorks />
        <TechStack />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
