import { Building2, UserPlus, Banknote } from "lucide-react";
import workerSilhouette from "@/assets/worker-silhouette.jpg";

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
    <section
      id="how-it-works"
      className="relative px-6 py-34 overflow-hidden"
    >
      {/* Background image + navy overlay */}
      <img
        src={workerSilhouette}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(6,34,71,0.70)" }} />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="mb-3 text-sm font-[800] uppercase tracking-[0.2em]" style={{ color: "#EB5E07" }}>
          How It Works
        </p>
        <h2 className="mb-5 text-4xl font-[900] text-white md:text-5xl lg:text-6xl leading-tight">
          Live in 3 simple steps
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">
          No complex integrations. No disruption to your payroll. Lamoola slots into your existing
          workflow and takes care of the rest.
        </p>

        <div className="mb-6 inline-flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={onOpenDemo}
            className="rounded-lg px-8 py-3 text-sm font-[800] text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#5F8B40" }}
          >
            Get Started Today
          </button>
          <span
            className="rounded-full px-4 py-1 text-xs font-[700] text-white"
            style={{ backgroundColor: "#EB5E07" }}
          >
            No cost to employer
          </span>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-xl border-t-[3px] px-6 py-8 text-left"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#EB5E07" }}
            >
              <s.icon size={32} strokeWidth={2} style={{ color: "#5F8B40" }} className="mb-4" />
              <p className="mb-1 text-xs font-[800] uppercase tracking-wider" style={{ color: "#EB5E07" }}>
                {s.step}
              </p>
              <p className="mb-3 text-lg font-[800]" style={{ color: "#1A1A1A" }}>
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
