import { useNavigate } from "react-router-dom";
import heroWorker from "@/assets/hero-worker.jpg";
import PinwheelIcon from "@/components/landing/PinwheelIcon";

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
    <section className="relative flex" style={{ minHeight: "100vh", paddingTop: 83, backgroundColor: "#FFFFFF" }}>
      <div className="grid w-full md:grid-cols-2">
        {/* Left column — text, vertically centred */}
        <div className="flex items-center px-8 py-20 md:px-16 lg:px-24">
          <div className="border-l-4 pl-10" style={{ borderColor: "#6AE809" }}>
            <p
              className="mb-8 uppercase tracking-[0.22em]"
              style={{ fontSize: 13, fontWeight: 800, color: "#EB5E07" }}
            >
              The Silent Cost Your Business Is Carrying
            </p>

            <h1
              className="mb-3 leading-[1.05]"
              style={{ fontSize: 64, fontWeight: 900, color: "#1A1A1A" }}
            >
              Your employees earned it.
            </h1>
            <h1
              className="mb-12 leading-[1.05]"
              style={{ fontSize: 64, fontWeight: 900, color: "#5F8B40" }}
            >
              They just can't access it yet.
            </h1>

            <p className="mb-16 max-w-lg" style={{ fontSize: 18, lineHeight: 1.8, color: "#545454" }}>
              Financial stress is quietly costing you in turnover, productivity, and risk.
              Lamoola fixes that — at zero cost to your business.
            </p>

            {/* Stat pills */}
            <div className="mb-16 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {STATS.map((s) => (
                <div
                  key={s.number}
                  className="rounded-xl border-2"
                  style={{ backgroundColor: "#F7F7F4", borderColor: "#5F8B40", padding: 20 }}
                >
                  <p className="mb-2" style={{ fontSize: 42, fontWeight: 900, color: "#6AE809" }}>
                    {s.number}
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "#323232" }}>
                    {s.text}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenDemo}
              className="text-white transition-opacity hover:opacity-90"
              style={{ fontSize: 18, fontWeight: 800, backgroundColor: "#062247", padding: "18px 40px", borderRadius: 10 }}
            >
              Book Your Free Demo
            </button>

            <p className="mt-6" style={{ fontSize: 15, color: "#545454" }}>
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="underline transition-colors hover:opacity-80"
                style={{ fontWeight: 700, color: "#5F8B40" }}
              >
                Login →
              </button>
            </p>
          </div>
        </div>

        {/* Pinwheel watermark — top-right */}
        <PinwheelIcon size={500} color="#5F8B40" className="pointer-events-none absolute -right-20 -top-16 opacity-[0.06] z-[1]" />

        {/* Right column — hero worker image */}
        <div className="relative hidden md:block overflow-hidden">
          <img
            src={heroWorker}
            alt="Construction worker with arms crossed wearing hard hat and hi-vis vest"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 20%", transform: "scale(1.15)" }}
          />
          {/* Navy overlay at 40% */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(6,34,71,0.40)" }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
