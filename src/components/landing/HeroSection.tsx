import { useNavigate } from "react-router-dom";
import heroWorker from "@/assets/hero-worker.jpg";



const STATS = [
  { number: "85%", text: "EWA users report less financial stress" },
  { number: "41%", text: "less turnover with EWA" },
  { number: "5×", text: "more distracted when financially stressed" },
  { number: "8%", text: "productivity increase" },
];

interface HeroSectionProps {
  onOpenDemo: () => void;
}

const HeroSection = ({ onOpenDemo }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative flex" style={{ minHeight: "100vh", paddingTop: 83, backgroundColor: "#062247" }}>
      <div className="grid w-full md:grid-cols-2">
        {/* Left column — text, vertically centred */}
        <div className="flex items-center px-8 py-20 md:px-16 lg:px-24">
          <div className="border-l-4 pl-10" style={{ borderColor: "#EB5E07" }}>
            <p
              className="mb-8 uppercase"
              style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: "#EB5E07" }}
            >
              The Silent Cost Your Business Is Carrying
            </p>

            <h1
              className="mb-3 leading-[1.05]"
              style={{ fontSize: 48, fontWeight: 900, color: "#FFFFFF", whiteSpace: "normal" }}
            >
              Your employees earned it.
            </h1>
            <h1
              className="mb-12 leading-[1.05]"
              style={{ fontSize: 48, fontWeight: 900, color: "#6AE809", whiteSpace: "normal" }}
            >
              They just can't access it yet.
            </h1>

            <p className="mb-16 max-w-lg" style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.75)" }}>
              Financial stress is quietly costing you in turnover, productivity, and risk.
              Lamoola fixes that — at zero cost to your business.
            </p>

            {/* Stat pills — 4-column grid */}
            <div className="mb-16 grid grid-cols-4 gap-4">
              {STATS.map((s) => (
                <div
                  key={s.number}
                  className="rounded-xl text-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.2)", padding: "20px 12px", minWidth: 130 }}
                >
                  <p className="mb-2" style={{ fontSize: 38, fontWeight: 900, color: "#6AE809" }}>
                    {s.number}
                  </p>
                  <p style={{ fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.85)" }}>
                    {s.text}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenDemo}
              className="text-white transition-opacity hover:opacity-90"
              style={{ fontSize: 18, fontWeight: 800, backgroundColor: "#EB5E07", padding: "18px 40px", borderRadius: 10 }}
            >
              Book Your Free Demo
            </button>

            <p className="mt-6" style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="underline transition-colors hover:opacity-80"
                style={{ fontWeight: 700, color: "#6AE809" }}
              >
                Login →
              </button>
            </p>
          </div>
        </div>

        {/* Pinwheel watermark — top-right */}
        <PinwheelIcon size={500} color="#5F8B40" className="pointer-events-none absolute -right-20 -top-16 opacity-[0.06] z-[1]" />

        {/* Right column — hero worker image */}
        <div className="relative hidden md:block overflow-hidden" style={{ backgroundColor: "#062247" }}>
          <img
            src={heroWorker}
            alt="Construction worker with arms crossed wearing hard hat and hi-vis vest"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center top", backgroundColor: "#062247", mixBlendMode: "multiply" }}
          />
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
