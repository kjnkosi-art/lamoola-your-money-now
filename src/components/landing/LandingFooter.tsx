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
    <footer className="px-6 py-16" style={{ backgroundColor: "#062247" }}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logoNav} alt="Lamoola" className="mb-3 h-8 w-auto" />
            <p className="text-sm italic text-white/50">
              Empowering Financial Wellness, One Paycheque at a Time
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-6">
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

          {/* Contact info */}
          <div className="flex flex-col items-center gap-2 text-sm text-white/60 md:items-end">
            <a href="mailto:hello@lamoola.co.za" className="hover:text-white transition-colors">
              hello@lamoola.co.za
            </a>
            <a href="tel:+27877113683" className="hover:text-white transition-colors">
              +27 87 711 3683
            </a>
            <a href="https://www.lamoola.co.za" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              www.lamoola.co.za
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-8 md:flex-row md:justify-between">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Lamoola. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button className="text-xs text-white/40 hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button className="text-xs text-white/40 hover:text-white transition-colors">
              Terms of Use
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
