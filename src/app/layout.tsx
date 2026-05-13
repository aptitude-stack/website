import type { Metadata } from "next"
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google"
import "./globals.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "Aptitude — Skill Registry",
  description: "Governed skill infrastructure for AI systems.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${ibmPlexMono.variable} ${ibmPlexSans.variable}`}>
      <body>
        <header style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-base)", position: "sticky", top: 0, zIndex: 50 }}>
          <nav style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" style={{ width: "22px", height: "auto", display: "block" }} />
              <span style={{ fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace", fontSize: "0.95rem", color: "var(--accent)", letterSpacing: "0.02em", fontWeight: 500 }}>
                aptitude
              </span>
            </a>
            <a href="https://api.aptitude-registry.dev/docs" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none", fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace" }}>
              API docs ↗
            </a>
          </nav>
        </header>
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          {children}
        </main>
        <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "1.5rem", textAlign: "center", color: "var(--text-dim)", fontSize: "0.75rem", fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace" }}>
          aptitude-registry · governed skill infrastructure
        </footer>
      </body>
    </html>
  )
}
