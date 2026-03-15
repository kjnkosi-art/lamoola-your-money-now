import logoNav from "@/assets/logo-nav.png";
import circlesCluster from "@/assets/circles-cluster.png";
import PinwheelIcon from "@/components/landing/PinwheelIcon";

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
    <footer className="relative overflow-hidden px-6" style={{ backgroundColor: "#062247", paddingTop: 60, paddingBottom: 40 }}>
      {/* Pinwheel watermark — large, right side */}
      <PinwheelIcon size={200} color="#FFFFFF" className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 opacity-[0.08]" />
      <img src={circlesCluster} alt="" className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 z-0" style={{ width: 200, opacity: 0.10 }} />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logoNav} alt="Lamoola" className="mb-3 h-10 w-auto" />
            <p className="italic" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              Empowering Financial Wellness, One Paycheque at a Time
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-6">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => onScrollTo(l.href)}
                className="font-semibold text-white/70 transition-colors hover:text-white"
                style={{ fontSize: 14 }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Contact info */}
          <div className="flex flex-col items-center md:items-end" style={{ fontSize: 14, lineHeight: 2.2, color: "rgba(255,255,255,0.6)" }}>
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
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} Lamoola. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button className="hover:text-white transition-colors" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              Privacy Policy
            </button>
            <button className="hover:text-white transition-colors" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              Terms of Use
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
