import joburgSkyline from "@/assets/joburg-skyline.jpg";
import circlesCluster from "@/assets/circles-cluster.png";
import PinwheelIcon from "@/components/landing/PinwheelIcon";

interface CTASectionProps {
  onOpenDemo: () => void;
}

const CTASection = ({ onOpenDemo }: CTASectionProps) => {
  return (
    <section id="contact" className="relative overflow-hidden -mt-px" style={{ padding: "120px 24px", backgroundColor: "#062247" }}>
      {/* Johannesburg skyline background */}
      <img
        src={joburgSkyline}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Navy overlay at 60% */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(6,34,71,0.60)" }} />

      {/* Pinwheel overlays — behind text, on top of background */}
      <PinwheelIcon size={220} color="#FFFFFF" className="pointer-events-none absolute -right-8 -top-8 opacity-[0.10] z-[1]" />
      <PinwheelIcon size={130} color="#FFFFFF" className="pointer-events-none absolute -left-6 -bottom-6 opacity-[0.08] z-[1]" />
      <img src={circlesCluster} alt="" className="pointer-events-none absolute -top-8 -right-8 z-[1]" style={{ width: 320, opacity: 0.12 }} />
      <img src={circlesCluster} alt="" className="pointer-events-none absolute -bottom-6 -left-6 z-[1]" style={{ width: 180, opacity: 0.08 }} />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="mb-8 text-white leading-tight" style={{ fontSize: 52, fontWeight: 900 }}>
          Ready to eliminate financial stress in your workforce?
        </h2>
        <p className="mb-12 text-white/80" style={{ fontSize: 18, lineHeight: 1.8 }}>
          Join forward-thinking South African employers who are boosting retention,
          productivity, and employee wellbeing — at zero cost.
        </p>
        <button
          onClick={onOpenDemo}
          className="text-white transition-colors"
          style={{ fontSize: 18, fontWeight: 800, backgroundColor: "#EB5E07", padding: "18px 48px", borderRadius: 10 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#5F8B40";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#EB5E07";
          }}
        >
          Request My Demo
        </button>
      </div>
    </section>
  );
};

export default CTASection;
