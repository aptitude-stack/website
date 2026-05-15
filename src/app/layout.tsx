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
            <div className="nav-actions">
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
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.2 4.8H6.6c-.9 0-1.6.7-1.6 1.6v11.2c0 .9.7 1.6 1.6 1.6h2.6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.5 12h8.2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="m15.7 8.8 3.2 3.2-3.2 3.2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.2 6.5h3.3c.9 0 1.6.7 1.6 1.6v.6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
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
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.8 4.8h2.6c.9 0 1.6.7 1.6 1.6v11.2c0 .9-.7 1.6-1.6 1.6h-2.6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M13.5 12H5.3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8.3 8.8 5.1 12l3.2 3.2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.8 6.5h-3.3c-.9 0-1.6.7-1.6 1.6v.6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="sr-only">Login</span>
                </Link>
              )}
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
                <span className="sr-only">Docs</span>
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
