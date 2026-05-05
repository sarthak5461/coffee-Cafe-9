import React from "react";

export default function MenuCard({ item }) {
  return (
    <article className="card-cafe group" data-testid={`menu-card-${item.id}`}>
      <div className="aspect-[4/3] overflow-hidden bg-cafe-cream">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-2xl text-cafe-ink leading-tight">{item.name}</h3>
          <span className="font-sans font-medium text-cafe-espresso shrink-0 mt-1">
            ₹{Math.round(item.price)}
          </span>
        </div>
        <p className="mt-2 text-sm text-cafe-muted leading-relaxed line-clamp-3">
          {item.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="eyebrow">{item.category}</span>
          {item.is_popular && (
            <span className="text-[10px] uppercase tracking-[0.18em] bg-cafe-terracotta/15 text-cafe-terracotta px-2.5 py-1 rounded-full">
              Popular
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
