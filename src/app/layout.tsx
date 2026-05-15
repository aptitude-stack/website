import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeModeControl } from "@/components/theme-mode-control";
import { getSession, signOut } from "@/lib/auth";
import { LOGIN_PATH } from "@/lib/auth-session";
import "./globals.css";

const themeBootstrapScript = `
try {
  const mode = window.localStorage.getItem("aptitude-theme-mode");
  if (mode === "light" || mode === "dark") {
    document.documentElement.dataset.theme = mode;
  }
} catch (_) {}
`;

export const metadata: Metadata = {
  title: "Aptitude",
  description: "Governed skill infrastructure for AI systems.",
  icons: {
    icon: [
      {
        url: "/logo.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  async function handleLogout() {
    "use server";

    await signOut();
    redirect(LOGIN_PATH);
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <header className="site-header">
          <nav className="site-nav" aria-label="Primary">
            <Link
              href="/catalog"
              className="brand-link"
              aria-label="Aptitude Registry catalog"
            >
              <Image
                className="brand-mark"
                src="/logo.svg"
                alt=""
                width={30}
                height={34}
                priority
              />
              <span className="brand-text" translate="no">
                <strong>Aptitude</strong>
                <span>Registry</span>
              </span>
            </Link>
            <div className="nav-links" aria-label="Catalog sections">
              <Link href="/catalog" className="nav-link">Catalog</Link>
              <Link href="/catalog#catalog-graph" className="nav-link">Graph</Link>
              <Link href="/catalog#catalog-results-title" className="nav-link">Top Skills</Link>
            </div>
            <div className="nav-actions">
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
              {session ? (
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
              )}
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
      </body>
    </html>
  );
}
