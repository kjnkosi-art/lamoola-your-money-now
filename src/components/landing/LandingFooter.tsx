import logoNav from "@/assets/logo-nav.png";

interface LandingFooterProps {
  onScrollTo: (href: string) => void;
}

const NAV_LINKS = [
  { label: "Why Lamoola", href: "#why-lamoola" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Financial Wellness", href: "#financial-wellness" },
  { label: "Contact", href: "#contact" },
];

const LandingFooter = ({ onScrollTo }: LandingFooterProps) => {
  return (
    <footer className="px-6 py-12" style={{ backgroundColor: "#062247" }}>
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex items-center">
          <img src={logoNav} alt="Lamoola" className="h-7 w-auto" />
        </div>
        <div className="flex gap-6">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => onScrollTo(l.href)}
              className="text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} Lamoola. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
