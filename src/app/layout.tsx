import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Archivo,
  Archivo_Black,
  IBM_Plex_Mono,
  Space_Mono,
} from "next/font/google";
import { ThemeModeControl } from "@/components/theme-mode-control";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-archivo-black",
  weight: "400",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
});

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
      className={`${archivoBlack.variable} ${archivo.variable} ${spaceMono.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <header className="site-header">
          <nav className="site-nav" aria-label="Primary">
            <Link
              href="/"
              className="brand-link"
              aria-label="Aptitude Registry home"
            >
              <Image
                className="brand-mark"
                src="/logo.svg"
                alt=""
                width={30}
                height={34}
              />
              <span className="brand-text" translate="no">
                <strong>Aptitude</strong>
                <span>Registry</span>
              </span>
            </Link>
            <div className="nav-actions">
              <Link href="/" className="nav-link">
                Catalog
              </Link>
              <a
                href="https://api.aptitude-registry.dev/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-cta"
              >
                API Docs ↗
              </a>
            </div>
          </nav>
        </header>
        <main id="main-content" className="site-main">
          {children}
        </main>
        <footer className="site-footer">
          <div className="site-footer__inner">
            <span translate="no">Aptitude Registry</span>
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
