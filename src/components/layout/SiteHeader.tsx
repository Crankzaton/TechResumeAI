"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/intake", label: "New Resume" },
  { href: "/admin", label: "Admin / Agent" },
  { href: "/docs", label: "Setup" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header no-print">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden />
        <span className="brand-text">
          Tech<em>Resume</em>AI
        </span>
      </Link>
      <nav>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href || pathname.startsWith(link.href + "/")
                ? "active"
                : undefined
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
