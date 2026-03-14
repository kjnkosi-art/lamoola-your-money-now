import { BookOpen, PiggyBank, HeartPulse, GraduationCap } from "lucide-react";

const TILES = [
  {
    icon: BookOpen,
    title: "Financial Literacy",
    desc: "In-app guides on budgeting, saving, and debt management — tailored for South African workers.",
  },
  {
    icon: PiggyBank,
    title: "Savings Nudges",
    desc: "Smart prompts encourage employees to save a portion of each access, building long-term habits.",
  },
  {
    icon: HeartPulse,
    title: "Stress Reduction",
    desc: "Removing the anxiety of waiting for payday improves mental health and workplace presence.",
  },
  {
    icon: GraduationCap,
    title: "Workshops & Webinars",
    desc: "Optional employer-branded financial wellness sessions delivered by certified professionals.",
  },
];

const FinancialWellnessSection = () => {
  return (
    <section id="financial-wellness" className="px-6 py-24" style={{ backgroundColor: "#F7F7F4" }}>
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        {/* Left column — text */}
        <div>
          <p className="mb-2 text-sm font-[800] uppercase tracking-widest" style={{ color: "#EB5E07" }}>
            Financial Wellness
          </p>
          <h2 className="mb-4 text-3xl font-[900] md:text-4xl" style={{ color: "#1A1A1A" }}>
            Beyond Early Pay
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "#545454" }}>
            Lamoola isn't just about accessing wages early. Our roadmap includes a full financial
            wellness ecosystem — from literacy tools to savings nudges — designed to help your
            workforce build lasting financial health. Healthier employees mean a healthier business.
          </p>
        </div>

        {/* Right column — 2×2 grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TILES.map((t) => (
            <div
              key={t.title}
              className="rounded-xl border px-5 py-6"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E0E0E0" }}
            >
              <t.icon size={28} strokeWidth={2} style={{ color: "#5F8B40" }} className="mb-3" />
              <p className="mb-1 text-sm font-[800]" style={{ color: "#1A1A1A" }}>
                {t.title}
              </p>
              <p className="text-xs leading-snug" style={{ color: "#545454" }}>
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
