import type { Metadata } from "next";
import Link from "next/link";
import { LandingCardEffects } from "@/components/landing-card-effects";
import { LandingWorkflowFlow } from "@/components/landing-workflow-flow";
import { BrandMarkIcon } from "@/components/icons/brand-mark-icon";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  {
    step: "01",
    label: "Policy",
    title: "Controls at every gate",
    text: "Publication, discovery, resolution, and execution all stay policy-aware.",
  },
  {
    step: "02",
    label: "Versions",
    title: "Exact fetch and replay",
    text: "Immutable versions, checksums, and lockfiles make capability use reproducible.",
  },
  {
    step: "03",
    label: "Signals",
    title: "Trust before usage",
    text: "Security, quality, benchmark, provenance, and lifecycle data travel with the skill.",
  },
  {
    step: "04",
    label: "Capability",
    title: "Managed instead of arbitrary",
    text: "Teams replace silent markdown/source changes with governed capability assets.",
  },
];

const controlPlaneRail = [
  "Publication",
  "Discovery",
  "Resolution",
  "Execution",
];

const audiences = [
  {
    label: "Systems / DevOps",
    title: "Platform and operations teams",
    text: "Govern publication, access, policy, versions, provenance, and runtime installation paths.",
  },
  {
    label: "Users",
    title: "Product, design, and development teams",
    text: "Find trusted capabilities, understand what they do, and reuse team knowledge without hunting through repos.",
  },
  {
    label: "Agents",
    title: "AI agents and agent hosts",
    text: "Discover, resolve, and install approved skills through the same governed capability layer.",
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

const contextQualityBars = [
  { label: "Forced load", value: 55.4, width: 100 },
  { label: "Curated", value: 51.2, width: 92 },
  { label: "Distractors added", value: 43.5, width: 78 },
  { label: "Curated retrieval", value: 40.1, width: 72 },
  { label: "Noisy retrieval", value: 38.4, width: 69 },
  { label: "No skills", value: 35.4, width: 64 },
];

const noisyRetrievalBars = [
  { label: "No-skill baseline", value: 21.2, width: 100 },
  { label: "Noisy retrieval", value: 19.8, width: 93 },
];

const refinementSteps = [
  { label: "No skills", value: 57.7, lift: 0 },
  { label: "Raw retrieval", value: 61.4, lift: 40 },
  { label: "Query-agnostic", value: 63.3, lift: 60 },
  { label: "Query-specific", value: 65.5, lift: 84 },
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingCardEffects />
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
          <svg
            className="landing-system__edges"
            viewBox="0 0 600 460"
            preserveAspectRatio="none"
          >
            <path className="landing-system__edge" d="M 252 164 C 210 150 184 124 154 102" />
            <path className="landing-system__edge" d="M 360 220 C 414 196 458 194 506 214" />
            <path className="landing-system__edge" d="M 294 306 C 270 350 230 372 176 360" />
          </svg>
          <div className="landing-system__mark">
            <BrandMarkIcon />
          </div>
          <div className="landing-system__node landing-system__node--publish">
            <span>Publish</span>
            <strong>Validated artifacts</strong>
          </div>
          <div className="landing-system__node landing-system__node--govern">
            <span>Govern</span>
            <strong>Policy + lifecycle</strong>
          </div>
          <div className="landing-system__node landing-system__node--resolve">
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
          <article data-skew-card>
            <span>Published</span>
            <strong>Validated artifacts</strong>
            <p>Skills enter through a controlled pipeline instead of ad hoc source installs.</p>
          </article>
          <article data-skew-card>
            <span>Discovered</span>
            <strong>Structured metadata</strong>
            <p>Humans and agents search a catalog without crawling GitHub or guessing identifiers.</p>
          </article>
          <article data-skew-card>
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
            <article className="landing-pillar" data-skew-card key={issue.label}>
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
        <Card className="landing-control-panel" data-skew-card>
          <CardHeader className="landing-control-panel__header">
            <Badge variant="outline" className="landing-control-panel__badge">
              Control Plane
            </Badge>
            <CardTitle className="landing-control-panel__title">
              Governed from publish to runtime.
            </CardTitle>
            <CardDescription className="landing-control-panel__description">
              Policy, versions, trust signals, and managed capability boundaries
              stay attached through the entire skill lifecycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="landing-control-panel__content">
            <div className="landing-control-panel__grid">
              {solutionControls.map((control) => (
                <article className="landing-control-panel__item" key={control.step}>
                  <Badge variant="secondary" className="landing-control-panel__step">
                    {control.step}
                  </Badge>
                  <span>{control.label}</span>
                  <strong>{control.title}</strong>
                  <p>{control.text}</p>
                </article>
              ))}
            </div>
          </CardContent>
          <CardFooter className="landing-control-panel__footer">
            <Separator className="landing-control-panel__separator" />
            <div className="landing-control-panel__rail">
              {controlPlaneRail.map((item) => (
                <Badge variant="secondary" key={item}>
                  {item}
                </Badge>
              ))}
            </div>
          </CardFooter>
        </Card>
      </section>

      <section
        id="evidence"
        className="landing-section landing-settle"
        aria-labelledby="evidence-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">Evidence</p>
          <h2 id="evidence-title">Skill quality matters more than simply adding more context.</h2>
          <p>
            The benchmark pattern is straightforward: curated context helps,
            noisy retrieval hurts, and refinement turns retrieval into a
            stronger operating loop.
          </p>
        </div>
        <div className="landing-evidence-grid">
          <article className="landing-evidence-card" data-skew-card>
            <div className="landing-evidence-card__header">
              <Badge variant="outline">Context quality</Badge>
              <strong>Curated skill context keeps pass rates higher.</strong>
            </div>
            <div className="landing-evidence-bars" aria-label="Pass rate by context quality">
              {contextQualityBars.map((bar) => (
                <div className="landing-evidence-row" key={bar.label}>
                  <span>{bar.label}</span>
                  <div className="landing-evidence-track">
                    <i style={{ inlineSize: `${bar.width}%` }} />
                  </div>
                  <strong>{bar.value.toFixed(1)}%</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="landing-evidence-card" data-skew-card>
            <div className="landing-evidence-card__header">
              <Badge variant="outline">Noise cost</Badge>
              <strong>Uncurated retrieval can trail a no-skill baseline.</strong>
            </div>
            <div className="landing-evidence-bars landing-evidence-bars--compact" aria-label="Average pass rate baseline versus noisy retrieval">
              {noisyRetrievalBars.map((bar) => (
                <div className="landing-evidence-row" key={bar.label}>
                  <span>{bar.label}</span>
                  <div className="landing-evidence-track">
                    <i style={{ inlineSize: `${bar.width}%` }} />
                  </div>
                  <strong>{bar.value.toFixed(1)}%</strong>
                </div>
              ))}
            </div>
            <p className="landing-evidence-note">
              Retrieval alone is not the win. Selection and curation are the
              difference between signal and extra surface area.
            </p>
          </article>

          <article className="landing-evidence-card" data-skew-card>
            <div className="landing-evidence-card__header">
              <Badge variant="outline">Refinement</Badge>
              <strong>Better selection compounds into higher pass rates.</strong>
            </div>
            <div className="landing-evidence-steps" aria-label="Pass rate gains from retrieval refinement">
              {refinementSteps.map((step) => (
                <div className="landing-evidence-step" key={step.label}>
                  <span>{step.label}</span>
                  <div className="landing-evidence-step__rail">
                    <i style={{ insetInlineStart: `${step.lift}%` }} />
                  </div>
                  <strong>{step.value.toFixed(1)}%</strong>
                </div>
              ))}
            </div>
          </article>
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
          <h2 id="audience-title">One capability layer for systems, teams, and agents.</h2>
          <p>
            Aptitude connects the operators who govern skills, the teams who use
            them, and the agents that need dependable capability discovery at
            runtime.
          </p>
        </div>
        <div className="landing-audience-grid">
          {audiences.map((audience) => (
            <article data-skew-card key={audience.label}>
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
            <article data-skew-card key={component.label}>
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
