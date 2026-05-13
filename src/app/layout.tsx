import type { Metadata } from "next"
import { Archivo_Black, Archivo, Space_Mono } from "next/font/google"
import "./globals.css"

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-archivo-black",
  weight: "400",
})

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Aptitude — Skill Registry",
  description: "Governed skill infrastructure for AI systems.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${archivo.variable} ${spaceMono.variable}`}>
      <body>
        <header style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-base)", position: "sticky", top: 0, zIndex: 50 }}>
          <nav style={{
            maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", height: "52px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: "var(--font-space-mono), 'Space Mono', ui-monospace, monospace",
            fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
          }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "var(--text-primary)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" style={{ width: "20px", height: "auto", display: "block" }} />
              <span style={{ color: "var(--accent)" }}>Aptitude</span>
            </a>
            <nav aria-label="Primary" style={{ display: "flex", gap: "clamp(18px, 2.4vw, 36px)" }}>
              <a href="https://api.aptitude-registry.dev/docs" target="_blank" rel="noopener noreferrer" className="nav-link">
                API ↗
              </a>
            </nav>
          </nav>
        </header>
        <main style={{
          maxWidth: "1100px", margin: "0 auto", padding: "clamp(20px, 2.4vw, 32px) clamp(20px, 3.6vw, 56px)",
          borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)",
          minHeight: "calc(100vh - 52px - 52px)",
        }}>
          {children}
        </main>
        <footer style={{
          maxWidth: "1100px", margin: "0 auto", width: "100%",
          padding: "clamp(14px, 1.6vw, 20px) clamp(20px, 3.6vw, 56px)",
          borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", gap: "16px",
          fontFamily: "var(--font-space-mono), 'Space Mono', ui-monospace, monospace",
          fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "var(--text-dim)",
        }}>
          <span>Aptitude Registry</span>
          <span>Governed skill infrastructure</span>
        </footer>
      </body>
    </html>
  )
}
