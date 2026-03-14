import circlesBg from "@/assets/circles-bg.png";

interface CTASectionProps {
  onOpenDemo: () => void;
}

const CTASection = ({ onOpenDemo }: CTASectionProps) => {
  return (
    <section id="contact" className="relative overflow-hidden px-6 py-44" style={{ backgroundColor: "#5F8B40" }}>
      {/* Pinwheel watermarks */}
      <img
        src={circlesBg}
        alt=""
        className="pointer-events-none absolute -right-20 -top-10 w-[400px] opacity-[0.08]"
        style={{ filter: "brightness(3)" }}
      />
      <img
        src={circlesBg}
        alt=""
        className="pointer-events-none absolute -left-16 -bottom-16 w-[300px] opacity-[0.08]"
        style={{ filter: "brightness(3)" }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="mb-8 text-4xl font-[900] text-white md:text-6xl lg:text-7xl leading-tight">
          Ready to eliminate financial stress in your workforce?
        </h2>
        <p className="mb-12 text-lg text-white/80 leading-relaxed">
          Join forward-thinking South African employers who are boosting retention,
          productivity, and employee wellbeing — at zero cost.
        </p>
        <button
          onClick={onOpenDemo}
          className="rounded-lg px-12 py-4 text-base font-[800] transition-colors"
          style={{ backgroundColor: "#FFFFFF", color: "#5F8B40" }}
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
