interface CTASectionProps {
  onOpenDemo: () => void;
}

const CTASection = ({ onOpenDemo }: CTASectionProps) => {
  return (
    <section id="contact" className="px-6 py-24" style={{ backgroundColor: "#5F8B40" }}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-[900] text-white md:text-4xl">
          Ready to eliminate financial stress in your workforce?
        </h2>
        <p className="mb-8 text-base text-white/80">
          Join forward-thinking South African employers who are boosting retention,
          productivity, and employee wellbeing — at zero cost.
        </p>
        <button
          onClick={onOpenDemo}
          className="rounded-lg border-2 border-white px-10 py-4 text-sm font-[800] text-white transition-colors hover:bg-white/15"
        >
          Request My Demo
        </button>
      </div>
    </section>
  );
};

export default CTASection;
