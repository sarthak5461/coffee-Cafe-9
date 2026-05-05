import React, { useEffect, useMemo, useState } from "react";
import MenuCard from "../components/MenuCard";
import { CardSkeleton } from "../components/Loading";
import ErrorState from "../components/ErrorState";
import { api } from "../lib/api";

const CATEGORIES = ["All", "Burgers", "Pasta", "Coffee", "Drinks", "Desserts"];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/menu");
      setItems(data);
    } catch (e) {
      setError("We couldn't load the menu right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => (active === "All" ? items : items.filter((i) => i.category === active)),
    [items, active]
  );

  return (
    <div className="pt-32 pb-24" data-testid="menu-page">
      <div className="container-cafe">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Our offerings</span>
          <h1 className="mt-3 font-serif text-5xl md:text-6xl text-cafe-ink">The Menu</h1>
          <p className="mt-4 text-cafe-muted">
            Slow-brewed coffee, comforting plates and sweet little endings. Pick your mood.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-2" data-testid="menu-categories">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              data-testid={`menu-category-${c.toLowerCase()}`}
              className={`px-5 py-2.5 rounded-full text-sm tracking-wide transition-all ${
                active === c
                  ? "bg-cafe-espresso text-cafe-paper shadow-md"
                  : "bg-cafe-cream text-cafe-ink hover:bg-cafe-espresso/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-cafe-muted">
              No items in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7" data-testid="menu-grid">
              {filtered.map((m) => <MenuCard key={m.id} item={m} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
