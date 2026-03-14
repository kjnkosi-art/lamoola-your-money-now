import joburgSkyline from "@/assets/joburg-skyline.jpg";
import PinwheelIcon from "@/components/landing/PinwheelIcon";

interface CTASectionProps {
  onOpenDemo: () => void;
}

const CTASection = ({ onOpenDemo }: CTASectionProps) => {
  return (
    <section id="contact" className="relative overflow-hidden" style={{ padding: "120px 24px" }}>
      {/* Johannesburg skyline background */}
      <img
        src={joburgSkyline}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Olive green overlay at 75% */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(95,139,64,0.75)" }} />

      {/* Pinwheel — very large, centred behind headline */}
      <PinwheelIcon size={700} color="#FFFFFF" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] z-0" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="mb-8 text-white leading-tight" style={{ fontSize: 48, fontWeight: 900 }}>
          Ready to eliminate financial stress in your workforce?
        </h2>
        <p className="mb-12 text-white/80" style={{ fontSize: 18, lineHeight: 1.8 }}>
          Join forward-thinking South African employers who are boosting retention,
          productivity, and employee wellbeing — at zero cost.
        </p>
        <button
          onClick={onOpenDemo}
          className="transition-colors"
          style={{ fontSize: 18, fontWeight: 800, backgroundColor: "#FFFFFF", color: "#5F8B40", padding: "18px 48px", borderRadius: 10 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#EB5E07";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
            e.currentTarget.style.color = "#5F8B40";
          }}
        >
          Request My Demo
        </button>
      </div>
    </section>
  );
};

export default CTASection;
