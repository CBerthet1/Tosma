"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export function SuccessToast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-5 z-[100] flex max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl border border-green-600/25 bg-background px-4 py-3 text-sm text-foreground shadow-xl"
    >
      <CheckCircle2 className="size-5 shrink-0 text-green-700 dark:text-green-400" aria-hidden="true" />
      <span className="flex-1 font-medium">{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Fermer la notification"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
