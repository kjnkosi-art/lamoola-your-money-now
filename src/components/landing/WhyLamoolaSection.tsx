import { Shield, TrendingUp, Clock, Wallet, Users } from "lucide-react";

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

const WhyLamoolaSection = () => {
  return (
    <section id="why-lamoola" className="px-6 py-28" style={{ backgroundColor: "#5F8B40" }}>
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-start">
        {/* Left column */}
        <div>
          <p className="mb-3 text-sm font-[800] uppercase tracking-[0.2em]" style={{ color: "#6AE809" }}>
            Why Lamoola
          </p>
          <h2 className="mb-6 text-3xl font-[900] text-white md:text-5xl leading-tight">
            Why South Africa's top employers choose Lamoola
          </h2>
          <p className="text-lg leading-relaxed text-white/80">
            Traditional pay cycles were designed for business, not people. With 75% of South African
            workers running out of money before payday, the old model is broken. Lamoola bridges the
            gap — giving employees instant access to wages they've already earned, while costing your
            business absolutely nothing.
          </p>
        </div>

        {/* Right column — benefit cards */}
        <div className="flex flex-col gap-5">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-5 rounded-xl border-l-4 px-6 py-6"
              style={{ backgroundColor: "rgba(255,255,255,0.10)", borderColor: "#6AE809" }}
            >
              <b.icon size={32} strokeWidth={2.5} style={{ color: "#6AE809", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="mb-2 text-base font-[800] text-white">{b.title}</p>
                <p className="text-sm leading-relaxed text-white/75">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyLamoolaSection;
