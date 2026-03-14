import { Shield, TrendingUp, Clock, Wallet, Users } from "lucide-react";
import teamWorkforce from "@/assets/team-workforce.jpg";
import PinwheelIcon from "@/components/landing/PinwheelIcon";

const BENEFITS = [
  {
    icon: Wallet,
    title: "Zero Cost to You",
    desc: "Lamoola is funded by a small, transparent employee service fee. Your business pays nothing.",
  },
  {
    icon: TrendingUp,
    title: "Boost Retention",
    desc: "Employees with EWA are 41% less likely to leave. Reduce recruitment and training costs.",
  },
  {
    icon: Clock,
    title: "Same-Day Setup",
    desc: "Go live in under 24 hours. No payroll changes, no IT projects, no disruption.",
  },
  {
    icon: Shield,
    title: "Fully Compliant",
    desc: "Built for South African labour law. Not a loan — employees access what they've already earned.",
  },
  {
    icon: Users,
    title: "Happier, Focused Teams",
    desc: "Financially secure employees are more productive, present, and engaged.",
  },
];

interface WhyLamoolaSectionProps {
  onOpenDemo: () => void;
}

const WhyLamoolaSection = ({ onOpenDemo }: WhyLamoolaSectionProps) => {
  return (
    <section id="why-lamoola" className="relative overflow-hidden px-6 py-44" style={{ backgroundColor: "#5F8B40" }}>
      {/* Background workforce image as subtle texture */}
      <img
        src={teamWorkforce}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.06]"
      />

      {/* Pinwheel watermarks — large top-right, medium bottom-left */}
      <PinwheelIcon size={550} color="#FFFFFF" className="pointer-events-none absolute -right-20 -top-16 opacity-[0.08]" />
      <PinwheelIcon size={380} color="#FFFFFF" className="pointer-events-none absolute -left-16 -bottom-20 opacity-[0.08]" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-20 md:grid-cols-2 md:items-start">
        {/* Left column */}
        <div>
          <p className="mb-4 text-sm font-[800] uppercase tracking-[0.2em]" style={{ color: "#6AE809" }}>
            Why Lamoola
          </p>
          <h2 className="mb-8 text-4xl font-[900] text-white md:text-5xl lg:text-6xl leading-tight">
            Why South Africa's top employers choose Lamoola
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-white/80">
            Traditional pay cycles were designed for business, not people. With 75% of South African
            workers running out of money before payday, the old model is broken. Lamoola bridges the
            gap — giving employees instant access to wages they've already earned, while costing your
            business absolutely nothing.
          </p>
          <button
            onClick={onOpenDemo}
            className="text-base font-[700] text-white underline underline-offset-4 transition-opacity hover:opacity-80"
          >
            Book a demo →
          </button>
        </div>

        {/* Right column — benefit cards */}
        <div className="flex flex-col gap-7">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-6 rounded-xl border-l-[3px] px-10 py-9"
              style={{ backgroundColor: "rgba(255,255,255,0.10)", borderColor: "#6AE809" }}
            >
              <b.icon size={34} strokeWidth={2.5} style={{ color: "#6AE809", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="mb-3 text-lg font-[800] text-white">{b.title}</p>
                <p className="text-base leading-relaxed text-white/75">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyLamoolaSection;
