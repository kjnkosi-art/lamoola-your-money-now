import { Building2, UserPlus, Banknote } from "lucide-react";
import howItWorksBg from "@/assets/how-it-works-bg.jpg";
import circlesCluster from "@/assets/circles-cluster.png";
import PinwheelIcon from "@/components/landing/PinwheelIcon";

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
      className="relative overflow-hidden"
      style={{ padding: "120px 24px" }}
    >
      {/* Background image + navy overlay */}
      <img
        src={howItWorksBg}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(6,34,71,0.65)" }} />

      {/* Pinwheel watermark — large top-right */}
      <PinwheelIcon size={500} color="#FFFFFF" className="pointer-events-none absolute -right-16 -top-10 opacity-[0.10]" />
      <img src={circlesCluster} alt="" className="pointer-events-none absolute -bottom-10 -right-10 z-0" style={{ width: 260, opacity: 0.12 }} />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="mb-4 uppercase" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: "#EB5E07" }}>
          How It Works
        </p>
        <h2 className="mb-6 text-white leading-tight" style={{ fontSize: 48, fontWeight: 900 }}>
          Simple. Seamless. Live in days.
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-white/80" style={{ fontSize: 17, lineHeight: 1.8 }}>
          No complex integrations. No disruption to your payroll. Lamoola slots into your existing
          workflow and takes care of the rest.
        </p>

        <div className="mb-8 inline-flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={onOpenDemo}
            className="rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ fontSize: 16, fontWeight: 800, backgroundColor: "#5F8B40", padding: "14px 32px" }}
          >
            Get Started Today
          </button>
          <span
            className="rounded-full text-white"
            style={{ fontSize: 13, fontWeight: 700, backgroundColor: "#EB5E07", padding: "6px 20px" }}
          >
            No cost to employer
          </span>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-xl border-t-[3px] text-left"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#EB5E07", padding: 28 }}
            >
              <s.icon size={34} strokeWidth={2} style={{ color: "#5F8B40" }} className="mb-5" />
              <p className="mb-2 uppercase" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: "#EB5E07" }}>
                {s.step}
              </p>
              <p className="mb-4" style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A" }}>
                {s.title}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#545454" }}>
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
