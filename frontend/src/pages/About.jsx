import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Coffee, Heart, Leaf } from "lucide-react";

const ABOUT_IMG = "https://images.unsplash.com/photo-1771784969433-970ccd2078ce";

export default function About() {
  const [home, setHome] = useState(null);
  useEffect(() => {
    api.get("/homepage").then((r) => setHome(r.data)).catch(() => {});
  }, []);

  return (
    <div className="pt-32 pb-24" data-testid="about-page">
      <div className="container-cafe">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="order-2 lg:order-1">
            <span className="eyebrow">Our story</span>
            <h1 className="mt-3 font-serif text-5xl md:text-6xl text-cafe-ink leading-[1.05]">
              A small cafe with a <em className="text-cafe-terracotta not-italic">big heart</em>.
            </h1>
            <p className="mt-6 text-lg text-cafe-muted leading-relaxed">
              {home?.about_text ||
                "Coffee Cafe 9 is a cozy and welcoming cafe known for its warm ambiance, delicious food, and friendly staff. It is a perfect place to relax, meet friends, and enjoy quality coffee and snacks."}
            </p>
            <p className="mt-4 font-devanagari text-cafe-muted">
              कॉफी कैफे नाईन — एक ऐसी जगह जहाँ हर कप के साथ एक मुस्कान मुफ़्त है।
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-5">
              {[
                { icon: Coffee, title: "Hand-brewed", text: "Crafted in small batches, served with care." },
                { icon: Heart, title: "Warm hosts", text: "Friendly faces who remember your usual." },
                { icon: Leaf, title: "Honest food", text: "Real ingredients, simple recipes, big flavour." },
              ].map((b) => (
                <div key={b.title} className="bg-cafe-cream rounded-2xl p-5">
                  <b.icon className="w-5 h-5 text-cafe-espresso" />
                  <div className="mt-3 font-serif text-xl text-cafe-ink">{b.title}</div>
                  <p className="text-xs text-cafe-muted mt-1 leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-cafe-line shadow-xl">
              <img src={ABOUT_IMG} alt="Barista at Coffee Cafe 9" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-cafe-espresso text-cafe-paper p-6 rounded-2xl shadow-xl max-w-xs hidden md:block">
              <div className="font-serif text-3xl">est. 2019</div>
              <div className="text-xs uppercase tracking-widest opacity-80 mt-1">Brewing happiness ever since</div>
            </div>
          </div>
        </div>

        {/* Values strip */}
        <div className="mt-24 bg-cafe-cream rounded-3xl p-10 md:p-14 grid md:grid-cols-3 gap-10">
          {[
            { n: "10K+", l: "Cups poured each month" },
            { n: "4.5★", l: "Average guest rating" },
            { n: "5 yrs", l: "Of warm conversations" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-serif text-5xl text-cafe-espresso">{s.n}</div>
              <div className="mt-1 text-sm text-cafe-muted uppercase tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
