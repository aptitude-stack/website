import type { Metadata } from "next";
import Link from "next/link";
import { LandingWorkflowFlow } from "@/components/landing-workflow-flow";
import { BrandMarkIcon } from "@/components/icons/brand-mark-icon";

export const metadata: Metadata = {
  title: "Aptitude | Governed Skill Infrastructure",
  description:
    "Aptitude turns scattered AI skills into governed, versioned, composable assets for humans, agents, CLI, and MCP workflows.",
  openGraph: {
    title: "Aptitude",
    description:
      "Governed skill infrastructure for teams building dependable AI agent systems.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Aptitude",
    description:
      "Governed skill infrastructure for teams building dependable AI agent systems.",
  },
};

const issues = [
  {
    label: "Accessibility",
    title: "Skills are scattered across repos, docs, and prompts.",
    text: "Agents still depend on crawling, cloning, and heuristics instead of a standard discovery surface.",
  },
  {
    label: "Quality and Security",
    title: "There is no reliable publish gate.",
    text: "Without validation, benchmarks, provenance, and trust tracking, capability usage stays unsafe and brittle.",
  },
  {
    label: "Governance",
    title: "Enterprises cannot separate available from allowed.",
    text: "Teams need lifecycle states, access controls, and policy enforcement before skills become operational defaults.",
  },
  {
    label: "Modularity",
    title: "Monolithic skills do too much.",
    text: "Atomic skills, dependencies, and lockfiles are required for reproducible bundles across users and agents.",
  },
];

const solutionControls = [
  "Policy controls at publication, discovery, resolution, and execution",
  "Immutable versions with exact fetch, checksums, and lock replay",
  "Security, quality, benchmark, provenance, and lifecycle signals",
  "Managed capabilities that replace arbitrary markdown and silent source changes",
];

const audiences = [
  {
    label: "Website",
    title: "Teams and knowledge workers",
    text: "Browse, inspect, install, and improve governed capabilities from a readable catalog.",
  },
  {
    label: "CLI",
    title: "Developers and platform teams",
    text: "Publish, resolve, pin, and replay skills inside CI and local workflows.",
  },
  {
    label: "MCP",
    title: "AI agents and hosts",
    text: "Discover and select capabilities through the same policy-aware interface humans use.",
  },
];

const composition = [
  {
    label: "Publisher",
    title: "Enforces",
    text: "Packages, validates, benchmarks, audits, captures provenance, and submits compliant artifacts.",
  },
  {
    label: "Registry",
    title: "Stores and governs",
    text: "Persists immutable versions, metadata, lifecycle state, access control, audit logs, discovery, and exact fetch APIs.",
  },
  {
    label: "Resolver",
    title: "Decides",
    text: "Selects candidates, applies policy filters, resolves dependencies, generates lockfiles, and materializes skills locally.",
  },
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero__copy">
          <p className="eyebrow">Governed Skill Infrastructure</p>
          <h1 id="landing-title" className="landing-title">
            Skills should behave like infrastructure.
          </h1>
          <p className="landing-description">
            Aptitude turns scattered prompts, scripts, and tools into structured,
            versioned, composable assets that can be published, discovered,
            resolved, and consumed by humans and AI agents.
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

        <div className="landing-system landing-system--hero" aria-hidden="true">
          <div className="landing-system__mark">
            <BrandMarkIcon />
          </div>
          <div className="landing-system__card landing-system__card--catalog">
            <span>Publish</span>
            <strong>Validated artifacts</strong>
          </div>
          <div className="landing-system__card landing-system__card--trust">
            <span>Govern</span>
            <strong>Policy + lifecycle</strong>
          </div>
          <div className="landing-system__card landing-system__card--agent">
            <span>Resolve</span>
            <strong>Lockfile + plan</strong>
          </div>
        </div>
      </section>

      <section
        id="overview"
        className="landing-section landing-section--split landing-settle"
        aria-labelledby="overview-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">Product Overview</p>
          <h2 id="overview-title">A governed package layer for agent skills.</h2>
          <p>
            Aptitude treats skills the way package managers treat libraries:
            structured metadata, immutable artifacts, exact versions, declared
            dependencies, and reproducible installation.
          </p>
        </div>
        <div className="landing-proof-grid" aria-label="Aptitude asset model">
          <article>
            <span>Published</span>
            <strong>Validated artifacts</strong>
            <p>Skills enter through a controlled pipeline instead of ad hoc source installs.</p>
          </article>
          <article>
            <span>Discovered</span>
            <strong>Structured metadata</strong>
            <p>Humans and agents search a catalog without crawling GitHub or guessing identifiers.</p>
          </article>
          <article>
            <span>Resolved</span>
            <strong>Safe bundles</strong>
            <p>Dependencies, policies, and versions produce a deterministic execution plan.</p>
          </article>
        </div>
      </section>

      <section
        id="issues"
        className="landing-section landing-settle"
        aria-labelledby="issues-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">The Problem</p>
          <h2 id="issues-title">Skills are useful, but the ecosystem is still loose.</h2>
          <p>
            Today, skills are difficult to discover, trust, govern, and compose
            reliably at scale. That creates low reuse, duplicated work, and
            unpredictable agent behavior.
          </p>
        </div>
        <div className="landing-pillars landing-pillars--four">
          {issues.map((issue) => (
            <article className="landing-pillar" key={issue.label}>
              <span>{issue.label}</span>
              <h3>{issue.title}</h3>
              <p>{issue.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="solution"
        className="landing-section landing-section--split landing-settle"
        aria-labelledby="solution-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">The Solution</p>
          <h2 id="solution-title">Control every layer, then compose smaller capabilities.</h2>
          <p>
            Aptitude moves teams from monolithic prompt bundles to modular skill
            assets. The result is better performance, sharper accuracy, and a
            managed path from arbitrary markdown to governed tools and
            capabilities.
          </p>
        </div>
        <div className="landing-control-panel">
          <span>Control Plane</span>
          <ul>
            {solutionControls.map((control) => (
              <li key={control}>{control}</li>
            ))}
          </ul>
        </div>
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
            The operating loop stays readable: author, review, publish, discover,
            resolve, and install. Governance stays attached at each step.
          </p>
        </div>
        <LandingWorkflowFlow />
      </section>

      <section
        id="audience"
        className="landing-section landing-settle"
        aria-labelledby="audience-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">Built For</p>
          <h2 id="audience-title">One capability layer for website, CLI, and MCP use.</h2>
          <p>
            Aptitude is for organizations where people and agents both perform
            work, and where that work must remain controlled, reproducible, and
            compliant.
          </p>
        </div>
        <div className="landing-audience-grid">
          {audiences.map((audience) => (
            <article key={audience.label}>
              <span>{audience.label}</span>
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="composition"
        className="landing-section landing-settle"
        aria-labelledby="composition-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">System Composition</p>
          <h2 id="composition-title">Publisher enforces. Registry stores. Resolver decides.</h2>
          <p>
            Aptitude separates enforcement, storage, and decision-making so each
            component owns one responsibility and the system remains deterministic.
          </p>
        </div>
        <div className="landing-composition">
          {composition.map((component) => (
            <article key={component.label}>
              <span>{component.label}</span>
              <strong>{component.title}</strong>
              <p>{component.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-final landing-settle" aria-labelledby="landing-final-title">
        <div>
          <p className="eyebrow">Catalog Access</p>
          <h2 id="landing-final-title">Start with governed skills. Keep agent behavior reproducible.</h2>
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
