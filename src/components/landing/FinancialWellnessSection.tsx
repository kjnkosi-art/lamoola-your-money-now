import { BookOpen, PiggyBank, HeartPulse, GraduationCap } from "lucide-react";
import wellnessPhone from "@/assets/wellness-phone.jpg";
import PinwheelIcon from "@/components/landing/PinwheelIcon";

const TILES = [
  {
    icon: BookOpen,
    title: "Financial Literacy",
    subtitle: "Knowledge is power",
    desc: "In-app guides on budgeting, saving, and debt management — tailored for South African workers.",
  },
  {
    icon: PiggyBank,
    title: "Savings Nudges",
    subtitle: "Build lasting habits",
    desc: "Smart prompts encourage employees to save a portion of each access, building long-term habits.",
  },
  {
    icon: HeartPulse,
    title: "Stress Reduction",
    subtitle: "Healthier workforce",
    desc: "Removing the anxiety of waiting for payday improves mental health and workplace presence.",
  },
  {
    icon: GraduationCap,
    title: "Workshops & Webinars",
    subtitle: "Expert-led sessions",
    desc: "Optional employer-branded financial wellness sessions delivered by certified professionals.",
  },
];

const FinancialWellnessSection = () => {
  return (
    <section id="financial-wellness" className="relative overflow-hidden" style={{ backgroundColor: "#F7F7F4", padding: "100px 24px" }}>
      {/* Pinwheel watermarks */}
      <PinwheelIcon size={280} color="#5F8B40" className="pointer-events-none absolute -left-10 -top-10 opacity-[0.06]" />
      <PinwheelIcon size={450} color="#5F8B40" className="pointer-events-none absolute -right-16 -bottom-16 opacity-[0.06]" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-20 md:grid-cols-2 md:items-center">
        {/* Left column — text + image */}
        <div>
          <p className="mb-4 uppercase tracking-[0.2em]" style={{ fontSize: 14, fontWeight: 800, color: "#EB5E07" }}>
            Financial Wellness
          </p>
          <h2 className="mb-8 leading-tight" style={{ fontSize: 42, fontWeight: 900, color: "#1A1A1A" }}>
            Beyond Early Pay
          </h2>
          <p className="mb-10" style={{ fontSize: 16, lineHeight: 1.9, color: "#545454" }}>
            Lamoola isn't just about accessing wages early. Our roadmap includes a full financial
            wellness ecosystem — from literacy tools to savings nudges — designed to help your
            workforce build lasting financial health. Healthier employees mean a healthier business.
          </p>
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={wellnessPhone}
              alt="Employee using financial wellness app on mobile"
              className="h-auto w-full object-cover"
              style={{ maxHeight: 320 }}
            />
            {/* Olive green tint overlay */}
            <div className="absolute inset-0 rounded-2xl" style={{ backgroundColor: "rgba(95,139,64,0.30)" }} />
          </div>
        </div>

        {/* Right column — 2×2 grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {TILES.map((t) => (
            <div
              key={t.title}
              className="rounded-xl border-l-4"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#EB5E07", padding: 24 }}
            >
              <t.icon size={30} strokeWidth={2} style={{ color: "#5F8B40" }} className="mb-4" />
              <p className="mb-2" style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>
                {t.title}
              </p>
              <p className="mb-3" style={{ fontSize: 14, fontWeight: 700, color: "#5F8B40" }}>
                {t.subtitle}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#545454" }}>
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinancialWellnessSection;
