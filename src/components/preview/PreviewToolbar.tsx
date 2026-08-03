"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ResumeData } from "@/lib/types";

export function PreviewToolbar({ resume }: { resume: ResumeData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function markDelivered() {
    startTransition(async () => {
      await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      router.refresh();
    });
  }

  function emailMe() {
    startTransition(async () => {
      await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "email" }),
      });
      router.refresh();
    });
  }

  return (
    <div className="preview-toolbar no-print">
      <div>
        <p className="eyebrow">
          Preview · {resume.technologyName} · {resume.layout}
        </p>
        <h1>{resume.fullName}</h1>
        <p className="meta">
          Status: <strong>{resume.status}</strong> · Source: {resume.source} · ID{" "}
          {resume.id}
        </p>
      </div>
      <div className="toolbar-actions">
        <button type="button" className="ghost-btn" onClick={() => window.print()}>
          Download / Print PDF
        </button>
        <button
          type="button"
          className="ghost-btn"
          disabled={pending}
          onClick={emailMe}
        >
          Email me link
        </button>
        <button
          type="button"
          className="primary-btn"
          disabled={pending}
          onClick={markDelivered}
        >
          Mark delivered
        </button>
      </div>
    </div>
  );
}
