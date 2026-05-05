import React from "react";
import { Coffee } from "lucide-react";

export default function Loading({ label = "Brewing..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-cafe-muted" data-testid="loading-indicator">
      <div className="relative">
        <Coffee className="w-9 h-9 text-cafe-espresso animate-pulse" />
      </div>
      <span className="mt-3 text-sm tracking-wide">{label}</span>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-cafe animate-pulse">
      <div className="aspect-[4/3] bg-cafe-cream" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-cafe-cream rounded" />
        <div className="h-3 w-full bg-cafe-cream rounded" />
        <div className="h-3 w-5/6 bg-cafe-cream rounded" />
      </div>
    </div>
  );
}
