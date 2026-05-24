import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { HeaderNavLinks } from "@/components/header-nav-links";
import { BrandMarkIcon } from "@/components/icons/brand-mark-icon";
import { ThemeModeControl } from "@/components/theme-mode-control";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession, signOut } from "@/lib/auth";
import { LOGIN_PATH } from "@/lib/auth-session";
import "@xyflow/react/dist/base.css";
import "./globals.css";

const themeBootstrapScript = `
try {
  const mode = window.localStorage.getItem("aptitude-theme-mode");
  if (mode === "light" || mode === "dark") {
    document.documentElement.dataset.theme = mode;
  }
} catch (_) {}
`;

const aptitudeIconDataUrl = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 403 451"><path fill="#a406bc" d="M154.2 48h186.2C361.8 48 379 65.2 379 86.6v189.1c0 10.5-4.2 20.6-11.6 28L268.1 403c-6.4 6.4-15.1 10-24.2 10H68.4C47.2 413 30 395.8 30 374.6V211.4c0-7.1 2-14 5.7-20.1L124.9 66c6.7-11.2 17.3-18 29.3-18Z"/><path fill="#fff7ed" d="M202.5 92h91l25 134h-60.8l-3.7-20.4h-12l-3.6 20.4h-60.9L202.5 92Z"/><path fill="#a406bc" d="M244.8 157h6.8l2.7 30h-12.2l2.7-30Z"/></svg>',
)}`;

export const metadata: Metadata = {
  title: "Aptitude",
  description: "Governed skill infrastructure for AI systems.",
  icons: {
    icon: [
      {
        url: aptitudeIconDataUrl,
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  },
};

async function AuthNavAction() {
  const session = await getSession();

  async function handleLogout() {
    "use server";

    await signOut();
    redirect(LOGIN_PATH);
  }

  return session ? (
    <form className="nav-logout-form" action={handleLogout}>
      <button
        className="nav-cta nav-cta--quiet"
        type="submit"
        aria-label="Logout"
        title="Logout"
      >
        <svg
          aria-hidden="true"
          className="nav-cta__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.2 5.2H7.4c-1 0-1.8.8-1.8 1.8v10c0 1 .8 1.8 1.8 1.8h6.8"
          />
          <path
            d="M10 12h8.8"
          />
          <path
            d="m15.5 8.7 3.3 3.3-3.3 3.3"
          />
        </svg>
        <span className="sr-only">Logout</span>
      </button>
    </form>
  ) : (
    <Link
      href="/login"
      className="nav-cta nav-cta--quiet"
      aria-label="Login"
      title="Login"
    >
      <svg
        aria-hidden="true"
        className="nav-cta__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.8 5.2h6.8c1 0 1.8.8 1.8 1.8v10c0 1-.8 1.8-1.8 1.8H9.8"
        />
        <path
          d="M5.2 12H14"
        />
        <path
          d="m10.7 8.7 3.3 3.3-3.3 3.3"
        />
      </svg>
      <span className="sr-only">Login</span>
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <TooltipProvider>
          <a className="skip-link" href="#main-content">
            Skip to main content
          </a>
          <header className="site-header">
            <nav className="site-nav" aria-label="Primary">
              <Link
                href="/"
                className="brand-link"
                aria-label="Aptitude home"
              >
                <BrandMarkIcon
                  className="brand-mark"
                  aria-hidden="true"
                  focusable="false"
                />
                <span className="brand-text" translate="no">
                  <strong>Aptitude</strong>
                  <span>Registry</span>
                </span>
              </Link>
              <div className="nav-actions">
                <Suspense fallback={null}>
                  <HeaderNavLinks />
                </Suspense>
                <a
                  href="https://github.com/aptitude-stack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-cta"
                  aria-label="Open Aptitude docs"
                  title="Docs"
                >
                  <svg
                    aria-hidden="true"
                    className="nav-cta__icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 5.8h4.5c1.4 0 2.5 1.1 2.5 2.5v10.4c0-1.4-1.1-2.5-2.5-2.5H5V5.8Z"
                    />
                    <path
                      d="M19 5.8h-4.5c-1.4 0-2.5 1.1-2.5 2.5v10.4c0-1.4 1.1-2.5 2.5-2.5H19V5.8Z"
                    />
                    <path
                      d="M12 8.3v10.4"
                    />
                  </svg>
                  <span className="sr-only">Docs</span>
                </a>
                <Suspense fallback={null}>
                  <AuthNavAction />
                </Suspense>
              </div>
            </nav>
          </header>
          <main id="main-content" className="site-main">
            {children}
          </main>
          <footer className="site-footer">
            <div className="site-footer__inner">
              <div className="footer-meta">
                <span className="footer-pip" aria-hidden="true" />
                <span>Governed skill infrastructure</span>
              </div>
              <ThemeModeControl />
            </div>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
