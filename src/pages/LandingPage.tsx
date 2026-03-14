import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoNav from "@/assets/logo-nav.png";
import circlesBg from "@/assets/circles-bg.png";

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
        className={`fixed top-0 left-0 right-0 z-50 transition-shadow ${
          scrolled ? "shadow-lg" : ""
        }`}
        style={{ backgroundColor: "#5F8B40" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center"
          >
            <img src={logoNav} alt="Lamoola" className="h-9 w-auto" />
          </button>

          {/* Desktop links */}
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="flex flex-col gap-2 px-6 pb-5 md:hidden"
            style={{ backgroundColor: "#4a7333" }}
          >
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
              onClick={() => {
                setMobileOpen(false);
                navigate("/login");
              }}
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
        style={{
          background: "linear-gradient(to right, #5F8B40, #6AE809, #EB5E07)",
        }}
      />

      {/* ── Hero Section (placeholder) ── */}
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
        style={{ backgroundColor: "#F7F7F4" }}
      >
        {/* Watermark pinwheels */}
        <div className="pointer-events-none absolute -top-10 -right-20 opacity-[0.05]">
          <PinwheelIcon size={500} color="#5F8B40" />
        </div>
        <div className="pointer-events-none absolute -bottom-16 -left-16 opacity-[0.05]">
          <PinwheelIcon size={320} color="#5F8B40" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p
            className="mb-4 text-sm font-[800] uppercase tracking-widest"
            style={{ color: "#EB5E07" }}
          >
            Early Wage Access
          </p>
          <h1
            className="mb-6 text-4xl font-[900] leading-tight md:text-6xl"
            style={{ color: "#323232" }}
          >
            Empowering Financial Wellness,{" "}
            <span style={{ color: "#5F8B40" }}>One Paycheck at a Time</span>
          </h1>
          <p
            className="mx-auto mb-8 max-w-2xl text-lg font-normal"
            style={{ color: "#545454" }}
          >
            Give your employees instant access to their earned wages. Reduce
            financial stress, boost retention, and build a healthier workforce
            — at zero cost to your business.
          </p>
          <button
            onClick={() => scrollTo("#contact")}
            className="rounded-lg px-8 py-3 text-sm font-[800] text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#5F8B40" }}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ── Section anchors (placeholder content) ── */}
      <section id="why-lamoola" className="min-h-[60vh] bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-2 text-sm font-[800] uppercase tracking-widest" style={{ color: "#EB5E07" }}>
            Why Lamoola
          </p>
          <h2 className="text-3xl font-[900] md:text-4xl" style={{ color: "#323232" }}>
            Why Choose Lamoola?
          </h2>
        </div>
      </section>

      <section id="how-it-works" className="min-h-[60vh] px-6 py-24" style={{ backgroundColor: "#F7F7F4" }}>
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-2 text-sm font-[800] uppercase tracking-widest" style={{ color: "#EB5E07" }}>
            How It Works
          </p>
          <h2 className="text-3xl font-[900] md:text-4xl" style={{ color: "#323232" }}>
            Simple. Fast. Seamless.
          </h2>
        </div>
      </section>

      <section id="financial-wellness" className="min-h-[60vh] bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-2 text-sm font-[800] uppercase tracking-widest" style={{ color: "#EB5E07" }}>
            Financial Wellness
          </p>
          <h2 className="text-3xl font-[900] md:text-4xl" style={{ color: "#323232" }}>
            Beyond Early Pay
          </h2>
        </div>
      </section>

      <section id="contact" className="min-h-[60vh] px-6 py-24" style={{ backgroundColor: "#F7F7F4" }}>
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-2 text-sm font-[800] uppercase tracking-widest" style={{ color: "#EB5E07" }}>
            Contact
          </p>
          <h2 className="text-3xl font-[900] md:text-4xl" style={{ color: "#323232" }}>
            Get In Touch
          </h2>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-12" style={{ backgroundColor: "#062247" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <PinwheelIcon size={28} color="#5F8B40" />
            <span className="text-lg font-[900] text-white">Lamoola</span>
          </div>
          <div className="flex gap-6">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-sm font-semibold text-white/70 transition-colors"
                style={{ }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6AE809")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Lamoola. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
