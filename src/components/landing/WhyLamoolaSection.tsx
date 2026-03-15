import { Shield, TrendingUp, Clock, Wallet, Users } from "lucide-react";
import teamWorkforce from "@/assets/team-workforce.jpg";
import pinwheelCluster from "@/assets/pinwheel-cluster.png";
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
    <section id="why-lamoola" className="relative overflow-hidden" style={{ backgroundColor: "#5F8B40", padding: "100px 24px" }}>
      {/* Background workforce image as subtle texture */}
      <img
        src={teamWorkforce}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.06]"
      />

      <img src={pinwheelCluster} alt="" className="pointer-events-none absolute -top-8 -right-8" style={{ width: 260, opacity: 0.12, zIndex: 0 }} />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-20 md:grid-cols-2 md:items-start">
        {/* Left column */}
        <div>
          <p className="mb-4 uppercase" style={{ fontSize: 14, fontWeight: 800, letterSpacing: 4, color: "#6AE809" }}>
            Why Lamoola
          </p>
          <h2 className="mb-8 text-white leading-tight" style={{ fontSize: 42, fontWeight: 900 }}>
            Why South Africa's top employers choose Lamoola
          </h2>
          <p className="mb-10 text-white/80" style={{ fontSize: 16, lineHeight: 1.9 }}>
            Traditional pay cycles were designed for business, not people. With 75% of South African
            workers running out of money before payday, the old model is broken. Lamoola bridges the
            gap — giving employees instant access to wages they've already earned, while costing your
            business absolutely nothing.
          </p>
          <button
            onClick={onOpenDemo}
            className="text-white underline underline-offset-4 transition-opacity hover:opacity-80"
            style={{ fontSize: 16, fontWeight: 700 }}
          >
            Book a demo →
          </button>
        </div>

        {/* Right column — benefit cards */}
        <div className="flex flex-col gap-7">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-6 rounded-xl border-l-[3px]"
              style={{ backgroundColor: "rgba(255,255,255,0.10)", borderColor: "#6AE809", padding: 24 }}
            >
              <b.icon size={34} strokeWidth={2.5} style={{ color: "#6AE809", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="mb-3 text-white" style={{ fontSize: 17, fontWeight: 700 }}>{b.title}</p>
                <p className="text-white/75" style={{ fontSize: 14, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyLamoolaSection;
