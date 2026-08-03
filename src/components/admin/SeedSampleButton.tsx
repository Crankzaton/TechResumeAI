"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SeedSampleButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function seed() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/resumes?seed=sample");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not load sample");
          return;
        }
        router.push(`/preview/${data.id}`);
        router.refresh();
      } catch {
        setError("Network error");
      }
    });
  }

  return (
    <div>
      <button type="button" className="ghost-btn" onClick={seed} disabled={pending}>
        {pending ? "Loading sample…" : "Load sample ServiceNow resume"}
      </button>
      {error && <p className="form-error" style={{ marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
