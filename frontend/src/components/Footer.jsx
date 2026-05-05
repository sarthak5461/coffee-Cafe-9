import React from "react";
import { Link } from "react-router-dom";
import { Coffee, MapPin, Phone, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-cafe-ink text-cafe-paper mt-24" data-testid="site-footer">
      <div className="container-cafe py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-cafe-terracotta text-cafe-ink">
              <Coffee className="w-5 h-5" />
            </span>
            <div>
              <div className="font-serif text-2xl">Coffee Cafe 9</div>
              <div className="font-devanagari text-xs opacity-70">कॉफी कैफे नाईन</div>
            </div>
          </div>
          <p className="mt-4 text-sm opacity-70 leading-relaxed">
            A cozy neighbourhood cafe in Malviya Nagar serving handcrafted coffee,
            comforting bites & warm conversations.
          </p>
        </div>

        <div>
          <div className="eyebrow text-cafe-terracotta">Visit</div>
          <p className="mt-3 flex gap-2 text-sm opacity-90">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            143, Khirki Extension, Malviya Nagar, New Delhi 110017
          </p>
          <p className="mt-3 flex gap-2 text-sm opacity-90">
            <Phone className="w-4 h-4 mt-0.5 shrink-0" />
            099116 84545
          </p>
        </div>

        <div>
          <div className="eyebrow text-cafe-terracotta">Explore</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/menu" className="hover:text-cafe-terracotta transition-colors">Menu</Link></li>
            <li><Link to="/reviews" className="hover:text-cafe-terracotta transition-colors">Reviews</Link></li>
            <li><Link to="/about" className="hover:text-cafe-terracotta transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-cafe-terracotta transition-colors">Contact</Link></li>
            <li><Link to="/admin/login" className="opacity-50 hover:opacity-100 hover:text-cafe-terracotta transition-colors">Admin</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow text-cafe-terracotta">Hours</div>
          <ul className="mt-3 space-y-1 text-sm opacity-90">
            <li>Mon – Fri · 9:00 AM – 11:00 PM</li>
            <li>Sat – Sun · 8:00 AM – 12:00 AM</li>
          </ul>
          <div className="flex gap-3 mt-5">
            <a href="#" aria-label="Instagram" className="w-9 h-9 grid place-items-center rounded-full border border-white/20 hover:bg-cafe-terracotta hover:text-cafe-ink transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Facebook" className="w-9 h-9 grid place-items-center rounded-full border border-white/20 hover:bg-cafe-terracotta hover:text-cafe-ink transition-colors"><Facebook className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-cafe py-5 flex flex-col md:flex-row gap-2 items-center justify-between text-xs opacity-70">
          <span>© {new Date().getFullYear()} Coffee Cafe 9. All rights reserved.</span>
          <span className="font-devanagari">कॉफी, गर्मजोशी और थोड़ी सी कहानियाँ.</span>
        </div>
      </div>
    </footer>
  );
}
