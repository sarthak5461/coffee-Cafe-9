import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Coffee } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/reviews", label: "Reviews" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-md bg-cafe-paper/85 border-b border-cafe-line" : "bg-transparent"
      }`}
    >
      <nav className="container-cafe flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-cafe-espresso text-cafe-paper group-hover:rotate-12 transition-transform">
            <Coffee className="w-5 h-5" />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-xl text-cafe-ink">Coffee Cafe 9</div>
            <div className="font-devanagari text-[11px] text-cafe-muted -mt-0.5">कॉफी कैफे नाईन</div>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm tracking-wide transition-all ${
                    isActive
                      ? "bg-cafe-espresso text-cafe-paper"
                      : "text-cafe-ink hover:text-cafe-espresso hover:bg-cafe-cream"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link to="/menu" className="hidden md:inline-flex btn-primary" data-testid="nav-cta-menu">
          View Menu
        </Link>

        <button
          aria-label="Toggle menu"
          data-testid="nav-mobile-toggle"
          className="md:hidden p-2 rounded-full text-cafe-ink hover:bg-cafe-cream"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-cafe-line bg-cafe-paper/95 backdrop-blur" data-testid="nav-mobile-menu">
          <div className="container-cafe py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-base ${
                    isActive ? "bg-cafe-espresso text-cafe-paper" : "text-cafe-ink hover:bg-cafe-cream"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/menu" className="btn-primary mt-2 w-full">View Menu</Link>
          </div>
        </div>
      )}
    </header>
  );
}
