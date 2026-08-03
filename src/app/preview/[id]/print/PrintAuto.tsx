"use client";

import { useEffect } from "react";

/** Triggers browser print once the resume-only page has painted. */
export function PrintAuto() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);
  return null;
}
