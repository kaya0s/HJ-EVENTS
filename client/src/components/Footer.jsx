import { Mail, MapPin, Phone, Heart, Code } from "lucide-react";
import Logo from "./Logo";
import { Link } from "react-router-dom";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-200 border-t border-base-300">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
              <Logo compact className="h-10 w-10" />
            </div>
            <div>
              <p className="text-lg font-semibold text-primary">HJ Weddings</p>
              <p className="text-sm text-base-content/60">
                Curating unforgettable celebrations with heart.
              </p>
            </div>
          </div>
          <p className="text-sm text-base-content/70">
            From intimate gatherings to grand affairs, we orchestrate weddings
            that reflect your love story in every detail.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">
            Explore
          </h3>
          <ul className="space-y-2 text-sm text-base-content/70">
            <li>
              <a className="transition hover:text-primary" href="/">
                Home
              </a>
            </li>
            <li>
              <Link to="/about" className="transition hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link
                to="/#packages"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    document
                      .getElementById("packages")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="transition hover:text-primary"
              >
                Packages
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition hover:text-primary">
                contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">
            Services
          </h3>
          <ul className="space-y-2 text-sm text-base-content/70">
            <li>Full-service planning</li>
            <li>On-the-day coordination</li>
            <li>Supplier management</li>
            <li>Custom styling & design</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">
            Contact
          </h3>
          <ul className="space-y-3 text-sm text-base-content/70">
            <li className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 text-primary" />
              <span>67 San Jose, Malaybalay City, Bukidnon</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-1 h-4 w-4 text-primary" />
              <a
                className="transition hover:text-primary"
                href="tel:+639171234567"
              >
                +63 917 123 4567
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 text-primary" />
              <a
                className="transition hover:text-primary"
                href="mailto:hello@hjweddings.com"
              >
                hello@hjweddings.com
              </a>
            </li>
            {/* Developers Link - designed as a distinct, styled button */}
            <li>
              <Link
                to="/developers"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/80 text-white font-semibold shadow transition hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                style={{
                  boxShadow:
                    "0 2px 8px 0 rgba(80, 70, 160, 0.10), 0 1.5px 4px 0 rgba(183, 156, 206, 0.06)",
                }}
              >
                <Code size={16} className="text-white" />
                Developers
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-base-300">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-6 text-sm text-base-content/60 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} HJ Weddings. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with{" "}
            <Heart className="h-4 w-4 text-primary" fill="currentColor" /> for
            timeless celebrations.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
