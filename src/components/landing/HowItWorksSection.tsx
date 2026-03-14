import { Building2, UserPlus, Banknote } from "lucide-react";

const STEPS = [
  {
    icon: Building2,
    step: "Step 1",
    title: "Employer Signs Up",
    desc: "We onboard your company in under 24 hours. No payroll system changes required — just a simple data handshake.",
  },
  {
    icon: UserPlus,
    step: "Step 2",
    title: "Employees Enrol",
    desc: "Your team registers via a mobile-friendly portal. ID verification, bank details, and T&Cs — done in minutes.",
  },
  {
    icon: Banknote,
    step: "Step 3",
    title: "Access Earned Wages",
    desc: "Employees request a portion of their already-earned salary anytime. Funds are paid out the same day.",
  },
];

interface HowItWorksSectionProps {
  onOpenDemo: () => void;
}

const HowItWorksSection = ({ onOpenDemo }: HowItWorksSectionProps) => {
  return (
    <section id="how-it-works" className="px-6 py-24" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-2 text-sm font-[800] uppercase tracking-widest" style={{ color: "#EB5E07" }}>
          How It Works
        </p>
        <h2 className="mb-4 text-3xl font-[900] md:text-4xl" style={{ color: "#1A1A1A" }}>
          Live in 3 simple steps
        </h2>
        <p className="mx-auto mb-6 max-w-2xl text-base" style={{ color: "#545454" }}>
          No complex integrations. No disruption to your payroll. Lamoola slots into your existing
          workflow and takes care of the rest.
        </p>

        <button
          onClick={onOpenDemo}
          className="mb-2 rounded-lg px-8 py-3 text-sm font-[800] text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#5F8B40" }}
        >
          Get Started Today
        </button>
        <span
          className="mb-10 inline-block rounded-full px-4 py-1 text-xs font-[700] text-white"
          style={{ backgroundColor: "#EB5E07" }}
        >
          No cost to employer
        </span>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-xl border-2 px-6 py-8 text-left"
              style={{ backgroundColor: "#F7F7F4", borderColor: "#5F8B40" }}
            >
              <s.icon size={32} strokeWidth={2} style={{ color: "#5F8B40" }} className="mb-4" />
              <p className="mb-1 text-xs font-[800] uppercase tracking-wider" style={{ color: "#EB5E07" }}>
                {s.step}
              </p>
              <p className="mb-2 text-lg font-[800]" style={{ color: "#1A1A1A" }}>
                {s.title}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#545454" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
