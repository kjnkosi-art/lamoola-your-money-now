import { useNavigate } from "react-router-dom";
import workerSilhouette from "@/assets/worker-silhouette.jpg";
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
    <section className="relative flex min-h-screen" style={{ paddingTop: 76, backgroundColor: "#FFFFFF" }}>
      <div className="grid w-full md:grid-cols-2">
        {/* Left column — text */}
        <div className="flex items-center px-8 py-24 md:px-16 lg:px-24">
          <div className="border-l-4 pl-10" style={{ borderColor: "#6AE809" }}>
            <p
              className="mb-8 text-xs font-[800] uppercase tracking-[0.2em]"
              style={{ color: "#EB5E07" }}
            >
              The Silent Cost Your Business Is Carrying
            </p>

            <h1 className="mb-3 text-5xl font-[900] leading-[1.05] md:text-6xl lg:text-7xl xl:text-8xl" style={{ color: "#1A1A1A" }}>
              Your employees earned it.
            </h1>
            <h1 className="mb-12 text-5xl font-[900] leading-[1.05] md:text-6xl lg:text-7xl xl:text-8xl" style={{ color: "#5F8B40" }}>
              They just can't access it yet.
            </h1>

            <p className="mb-16 max-w-lg text-lg leading-relaxed" style={{ color: "#545454" }}>
              Financial stress is quietly costing you in turnover, productivity, and risk.
              Lamoola fixes that — at zero cost to your business.
            </p>

            {/* Stat pills */}
            <div className="mb-16 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {STATS.map((s) => (
                <div
                  key={s.number}
                  className="rounded-xl border-2 px-5 py-6"
                  style={{ backgroundColor: "#F7F7F4", borderColor: "#5F8B40" }}
                >
                  <p className="mb-2 text-4xl font-[900] lg:text-5xl" style={{ color: "#6AE809" }}>
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
              className="rounded-lg px-10 py-4 text-base font-[800] text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#062247" }}
            >
              Book Your Free Demo
            </button>

            <p className="mt-6 text-sm" style={{ color: "#545454" }}>
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
        </div>

        {/* Right column — zoomed silhouette image */}
        <div className="relative hidden md:block overflow-hidden">
          <img
            src={workerSilhouette}
            alt="Worker silhouette with city lights double exposure"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 20%", transform: "scale(1.3)" }}
          />
          {/* Navy overlay at 65% */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(6,34,71,0.65)" }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
