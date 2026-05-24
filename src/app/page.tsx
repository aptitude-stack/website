import type { Metadata } from "next";
import Link from "next/link";
import { LandingWorkflowFlow } from "@/components/landing-workflow-flow";

export const metadata: Metadata = {
  title: "Aptitude | Governed Skills For AI Agents",
  description:
    "Aptitude gives agent builders a governed catalog of installable, versioned skills for dependable AI coding workflows.",
  openGraph: {
    title: "Aptitude",
    description:
      "Governed skill infrastructure for teams building dependable AI coding agents.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Aptitude",
    description:
      "Governed skill infrastructure for teams building dependable AI coding agents.",
  },
};

const pillars = [
  {
    label: "Catalog",
    title: "Governed skill packages",
    text: "Keep skill ownership, maturity, install context, and trust tier attached to the thing agents discover.",
  },
  {
    label: "Resolution",
    title: "Agent-ready discovery",
    text: "Resolve the right skill for a task without forcing every workflow into one brittle prompt.",
  },
  {
    label: "Control",
    title: "Auditable change",
    text: "Separate catalog facts, review signals, and runtime use so agent behavior can evolve with oversight.",
  },
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero__copy">
          <p className="eyebrow">Governed Skill Infrastructure</p>
          <h1 id="landing-title" className="landing-title">
            Governed skills for AI coding agents.
          </h1>
          <p className="landing-description">
            Aptitude gives teams a clear catalog for the skills, workflows, and
            operating knowledge agents need before they automate.
          </p>
          <div className="landing-actions" aria-label="Primary actions">
            <Link className="landing-button landing-button--primary" href="/login">
              Login
            </Link>
            <a
              className="landing-button landing-button--secondary"
              href="mailto:hello@aptitude.dev?subject=Aptitude%20demo"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </section>

      <section
        id="platform"
        className="landing-section landing-settle"
        aria-labelledby="platform-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">Platform</p>
          <h2 id="platform-title">A catalog that treats skills as infrastructure.</h2>
          <p>
            Skills should not live as loose snippets. Aptitude keeps useful
            instructions tied to the metadata teams need to inspect, trust, and
            install them.
          </p>
        </div>
        <div className="landing-pillars">
          {pillars.map((pillar) => (
            <article className="landing-pillar" key={pillar.label}>
              <span>{pillar.label}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="governance"
        className="landing-section landing-section--split landing-settle"
        aria-labelledby="governance-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">Governance</p>
          <h2 id="governance-title">Make agent behavior inspectable before it spreads.</h2>
          <p>
            Review lifecycle state, ranking, ownership, and policy signals
            before skills become defaults in agent workflows.
          </p>
        </div>
        <dl className="landing-trust-grid">
          <div>
            <dt>Versioned</dt>
            <dd>Every install resolves to an explicit skill version.</dd>
          </div>
          <div>
            <dt>Ranked</dt>
            <dd>Discovery can prefer maintained, trusted skills without hiding alternatives.</dd>
          </div>
          <div>
            <dt>Bounded</dt>
            <dd>The catalog stores governance facts, not raw runtime logs.</dd>
          </div>
        </dl>
      </section>

      <section
        id="workflow"
        className="landing-section landing-settle"
        aria-labelledby="workflow-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">Workflow</p>
          <h2 id="workflow-title">A simple path from team practice to agent runtime.</h2>
          <p>
            Aptitude keeps the loop readable from authoring to install, then
            back into governed improvement.
          </p>
        </div>
        <LandingWorkflowFlow />
      </section>

      <section className="landing-final landing-settle" aria-labelledby="landing-final-title">
        <div>
          <p className="eyebrow">Catalog Access</p>
          <h2 id="landing-final-title">Start with the registry. Keep the agents honest.</h2>
        </div>
        <div className="landing-final__actions">
          <Link className="landing-button landing-button--primary" href="/login">
            Login
          </Link>
          <a
            className="landing-button landing-button--secondary"
            href="mailto:hello@aptitude.dev?subject=Aptitude%20demo"
          >
            Book a Demo
          </a>
        </div>
      </section>
    </div>
  );
}
