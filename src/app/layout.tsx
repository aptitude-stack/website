import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ThemeModeControl } from "@/components/theme-mode-control";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <div className="nav-actions">
              <Link href="/login" className="nav-cta nav-cta--quiet">
                Login
              </Link>
              <a
                href="https://github.com/aptitude-stack"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-cta"
                aria-label="Open Aptitude docs"
              >
                <svg
                  aria-hidden="true"
                  className="nav-cta__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 6.5h4.4c1.45 0 2.6 1.15 2.6 2.6 0-1.45 1.15-2.6 2.6-2.6H19v10.8h-4.4c-1.45 0-2.6 1.15-2.6 2.6 0-1.45-1.15-2.6-2.6-2.6H5V6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 9.1v10.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Docs</span>
              </a>
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
