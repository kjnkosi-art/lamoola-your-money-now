import { useNavigate } from "react-router-dom";

const STATS = [
  { number: "85%", text: "of EWA users report reduced financial stress — ILO 2025" },
  { number: "41%", text: "less employee turnover where EWA is offered — HR Brew 2024" },
  { number: "5×", text: "more distracted at work when financially stressed — PwC 2023" },
  { number: "8%", text: "measurable productivity increase — Good Business Lab" },
];

interface HeroSectionProps {
  onOpenDemo: () => void;
}

const HeroSection = ({ onOpenDemo }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-screen items-center justify-center pt-16" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p
          className="mb-4 text-sm font-[800] uppercase tracking-widest"
          style={{ color: "#EB5E07" }}
        >
          The Silent Cost Your Business Is Carrying
        </p>

        <h1 className="mb-2 text-4xl font-[900] leading-tight md:text-6xl" style={{ color: "#1A1A1A" }}>
          Your employees earned it.
        </h1>
        <h1 className="mb-6 text-4xl font-[900] leading-tight md:text-6xl" style={{ color: "#5F8B40" }}>
          They just can't access it yet.
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg" style={{ color: "#545454" }}>
          Financial stress is quietly costing you in turnover, productivity, and risk.
          Lamoola fixes that — at zero cost to your business.
        </p>

        {/* Stat pills */}
        <div className="mx-auto mb-10 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.number}
              className="rounded-xl border px-4 py-5"
              style={{ backgroundColor: "#F7F7F4", borderColor: "#5F8B40" }}
            >
              <p className="mb-1 text-3xl font-[900]" style={{ color: "#6AE809" }}>
                {s.number}
              </p>
              <p className="text-xs leading-snug" style={{ color: "#545454" }}>
                {s.text}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenDemo}
          className="rounded-lg px-10 py-4 text-sm font-[800] text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#5F8B40" }}
        >
          Book Your Free Demo
        </button>

        <p className="mt-4 text-sm" style={{ color: "#545454" }}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-[700] underline transition-colors hover:opacity-80"
            style={{ color: "#5F8B40" }}
          >
            Login →
          </button>
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
