import React from "react";
import { Star, Quote } from "lucide-react";

export default function ReviewCard({ review }) {
  const r = Number(review.rating || 0);
  return (
    <article
      className="bg-cafe-cream rounded-2xl p-7 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      data-testid={`review-card-${review.id}`}
    >
      <Quote className="w-8 h-8 text-cafe-terracotta/70 absolute -top-3 left-6 bg-cafe-paper rounded-full p-1.5" />
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.round(r) ? "fill-cafe-terracotta text-cafe-terracotta" : "text-cafe-line"}`}
          />
        ))}
      </div>
      <p className="font-serif text-lg text-cafe-ink leading-snug italic">
        “{review.comment}”
      </p>
      <div className="mt-5 pt-4 border-t border-cafe-line/70 flex items-center justify-between">
        <span className="text-sm font-medium text-cafe-ink">{review.name}</span>
        <span className="text-xs text-cafe-muted">{r.toFixed(1)} / 5</span>
      </div>
    </article>
  );
}
