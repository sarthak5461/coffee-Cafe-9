import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Utensils, ShoppingBag, Bike, MapPin, Phone, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import MenuCard from "../components/MenuCard";
import ReviewCard from "../components/ReviewCard";
import { CardSkeleton } from "../components/Loading";

const HERO_BG = "https://images.pexels.com/photos/35113259/pexels-photo-35113259.jpeg";

export default function Home() {
  const [home, setHome] = useState(null);
  const [popular, setPopular] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [h, m, r] = await Promise.all([
          api.get("/homepage"),
          api.get("/menu", { params: { popular: true } }),
          api.get("/reviews", { params: { featured: true } }),
        ]);
        if (!alive) return;
        setHome(h.data);
        setPopular(m.data);
        setReviews(r.data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden grain">
        <img
          src={HERO_BG}
          alt="Cafe interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cafe-ink/60 via-cafe-ink/30 to-cafe-ink/85" />
        <div className="container-cafe relative z-10 pb-20 pt-32 text-cafe-paper">
          <div className="max-w-3xl animate-fade-up">
            <span className="eyebrow text-cafe-terracotta">Since the first sip · Malviya Nagar</span>
            <h1 className="mt-4 text-5xl md:text-7xl font-serif leading-[1.05]" data-testid="hero-title">
              Coffee Cafe 9
            </h1>
            <div
              className="mt-2 text-3xl md:text-4xl font-devanagari text-cafe-paper/90"
              data-testid="hero-subtitle"
            >
              कॉफी कैफे नाईन
            </div>
            <p className="mt-6 text-lg md:text-xl text-cafe-paper/85 max-w-xl italic font-serif">
              “{home?.hero_tagline || "Good ambiance, tasty food, and friendly staff"}”
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/menu" className="btn-primary" data-testid="hero-cta-menu">
                View Menu <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="btn-ghost-glass" data-testid="hero-cta-visit">
                Visit Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick info bar */}
      <section className="container-cafe -mt-14 relative z-20">
        <div className="bg-cafe-snow rounded-2xl shadow-lg border border-cafe-line grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          <div className="p-7 flex items-center gap-4 border-b md:border-b-0 md:border-r border-cafe-line">
            <div className="w-12 h-12 grid place-items-center rounded-full bg-cafe-cream text-cafe-terracotta">
              <Star className="w-5 h-5 fill-cafe-terracotta" />
            </div>
            <div>
              <div className="font-serif text-2xl text-cafe-ink">{home?.rating || 4.5} <span className="text-cafe-muted text-base">/ 5</span></div>
              <div className="text-xs uppercase tracking-widest text-cafe-muted">{home?.review_count || 800}+ reviews</div>
            </div>
          </div>
          <div className="p-7 flex items-center gap-4 border-b md:border-b-0 md:border-r border-cafe-line">
            <div className="w-12 h-12 grid place-items-center rounded-full bg-cafe-cream text-cafe-espresso">
              <span className="font-serif text-lg">₹</span>
            </div>
            <div>
              <div className="font-serif text-2xl text-cafe-ink">{home?.price_range || "₹200–400"}</div>
              <div className="text-xs uppercase tracking-widest text-cafe-muted">For two · approx</div>
            </div>
          </div>
          <div className="p-7 flex items-center gap-4">
            <div className="w-12 h-12 grid place-items-center rounded-full bg-cafe-cream text-cafe-espresso">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(home?.services || ["Dine-in", "Takeaway", "No-contact delivery"]).map((s) => (
                <span key={s} className="text-xs uppercase tracking-widest bg-cafe-cream text-cafe-espresso px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular items */}
      <section className="container-cafe py-24" data-testid="popular-section">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <span className="eyebrow">Most Loved</span>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl text-cafe-ink">Popular at the cafe</h2>
          </div>
          <Link to="/menu" className="text-cafe-espresso text-sm font-medium inline-flex items-center gap-2 hover:gap-3 transition-all" data-testid="popular-view-all">
            See full menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : popular.slice(0, 6).map((m) => <MenuCard key={m.id} item={m} />)}
        </div>
      </section>

      {/* Services */}
      <section className="bg-cafe-cream py-24" data-testid="services-section">
        <div className="container-cafe">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">How we serve you</span>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl text-cafe-ink">Three simple ways</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-7">
            {[
              { icon: Utensils, title: "Dine-in", text: "Pull up a chair, settle in. Cozy seating, slow afternoons, good music." },
              { icon: ShoppingBag, title: "Takeaway", text: "On the move? Grab your favourite cuppa, freshly brewed and packed neat." },
              { icon: Bike, title: "Delivery", text: "No-contact delivery to your doorstep — same warmth, less waiting." },
            ].map((s) => (
              <div key={s.title} className="bg-cafe-snow rounded-2xl p-8 border border-cafe-line transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-12 h-12 grid place-items-center rounded-full bg-cafe-espresso text-cafe-paper">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-5 font-serif text-2xl text-cafe-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-cafe-muted leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews preview */}
      <section className="container-cafe py-24" data-testid="reviews-preview-section">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <span className="eyebrow">From our regulars</span>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl text-cafe-ink">Words by the window</h2>
          </div>
          <Link to="/reviews" className="text-cafe-espresso text-sm font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
            Read all reviews <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {(reviews.length ? reviews : []).slice(0, 3).map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="bg-cafe-ink text-cafe-paper py-24" data-testid="location-section">
        <div className="container-cafe grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="eyebrow">Find us</span>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl">A small lane, a big aroma.</h2>
            <p className="mt-4 text-cafe-paper/75 max-w-md leading-relaxed">
              Tucked away in the lanes of Khirki Extension — easy to spot once the
              coffee scent hits you.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex gap-3"><MapPin className="w-5 h-5 mt-0.5 text-cafe-terracotta" /> {home?.address || "143, Khirki Extension, Malviya Nagar, New Delhi 110017"}</li>
              <li className="flex gap-3"><Phone className="w-5 h-5 mt-0.5 text-cafe-terracotta" /> {home?.phone || "099116 84545"}</li>
            </ul>
            <Link to="/contact" className="btn-primary mt-8">Get directions</Link>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <iframe
              title="Coffee Cafe 9 location"
              src="https://www.google.com/maps?q=143%20Khirki%20Extension%2C%20Malviya%20Nagar%2C%20New%20Delhi%20110017&output=embed"
              className="w-full h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              data-testid="home-map"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
