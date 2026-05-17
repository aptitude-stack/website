"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isLoginPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/login/");
}

export function HeaderNavLinks() {
  const pathname = usePathname();

  if (pathname && isLoginPath(pathname)) {
    return null;
  }

  return (
    <div className="header-nav-links" aria-label="Catalog sections">
      <Link href="/catalog#catalog-search" className="nav-link">
        Search
      </Link>
      <Link href="/catalog#catalog-features" className="nav-link">
        Features
      </Link>
      <Link href="/catalog#catalog-metrics" className="nav-link">
        Metrics
      </Link>
    </div>
  );
}
