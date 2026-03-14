import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoNav from "@/assets/logo-nav.png";
import HeroSection from "@/components/landing/HeroSection";
import WhyLamoolaSection from "@/components/landing/WhyLamoolaSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FinancialWellnessSection from "@/components/landing/FinancialWellnessSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import DemoModal from "@/components/landing/DemoModal";

const NAV_LINKS = [
  { label: "Why Lamoola", href: "#why-lamoola" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Financial Wellness", href: "#financial-wellness" },
  { label: "Contact", href: "#contact" },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-nunito scroll-smooth">
      {/* ── Sticky Nav ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-shadow ${scrolled ? "shadow-lg" : ""}`}
        style={{ backgroundColor: "#5F8B40" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center">
            <img src={logoNav} alt="Lamoola" className="h-9 w-auto" />
          </button>

          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-sm font-semibold text-white/80 transition-colors hover:text-white"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg border border-white px-5 py-2 text-sm font-[800] text-white transition-colors hover:bg-white/15"
            >
              Login
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="flex flex-col gap-2 px-6 pb-5 md:hidden" style={{ backgroundColor: "#4a7333" }}>
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="py-2 text-left text-sm font-semibold text-white/90 hover:text-white"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => { setMobileOpen(false); navigate("/login"); }}
              className="mt-1 rounded-lg border border-white px-5 py-2 text-sm font-[800] text-white hover:bg-white/15"
            >
              Login
            </button>
          </div>
        )}
      </nav>

      {/* ── Gradient divider strip ── */}
      <div
        className="fixed top-[56px] left-0 right-0 z-50 h-1"
        style={{ background: "linear-gradient(to right, #5F8B40, #6AE809, #EB5E07)" }}
      />

      <HeroSection onOpenDemo={() => setDemoOpen(true)} />
      <WhyLamoolaSection />
      <HowItWorksSection onOpenDemo={() => setDemoOpen(true)} />
      <FinancialWellnessSection />
      <CTASection onOpenDemo={() => setDemoOpen(true)} />
      <LandingFooter onScrollTo={scrollTo} />

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
};

export default LandingPage;
