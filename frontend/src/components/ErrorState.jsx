import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({ message = "Something brewed wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="error-state">
      <div className="w-12 h-12 grid place-items-center rounded-full bg-cafe-cream text-cafe-espresso mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <p className="text-cafe-ink font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 btn-outline"
          data-testid="error-retry-btn"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      )}
    </div>
  );
}
