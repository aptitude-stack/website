import type { Metadata } from "next";
import Link from "next/link";
import { LandingCardEffects } from "@/components/landing-card-effects";
import { LandingWorkflowFlow } from "@/components/landing-workflow-flow";
import { SystemCompositionDiagram } from "@/components/system-composition-diagram";
import { TextType } from "@/components/text-type";
import { Badge } from "@/components/ui/badge";

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
    label: "Audit",
    title: "Validate every capability before reuse.",
    text: "Package checks, security review, quality benchmarks, and provenance capture turn raw skills into trusted artifacts.",
  },
  {
    step: "02",
    label: "Govern",
    title: "Attach policy, lifecycle, and access rules.",
    text: "Lifecycle state, trust tier, ownership, and installation policy travel with each skill version.",
  },
  {
    step: "03",
    label: "Compose",
    title: "Resolve approved skills into locked bundles.",
    text: "Approved skills are selected, dependency-checked, locked to exact versions, and installed as repeatable plans.",
  },
];

const heroPhrases = [
  "Governed agent skills.",
  "Validated artifacts.",
  "Policy-aware plans.",
  "Composable skills.",
];

const audiences = [
  {
    label: "Systems / DevOps",
    title: "Platform and operations teams",
    text: "Govern publication, access, policy, versions, provenance, and runtime installation paths.",
  },
  {
    label: "Users",
    title: "Product, dev, design, and more",
    text: "Anyone using agents can find trusted capabilities, understand what they do, and reuse shared knowledge without hunting through repos.",
  },
  {
    label: "Agents",
    title: "AI agents and agent hosts",
    text: "Discover, resolve, and install approved skills through the same governed capability layer.",
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
          <h1
            id="landing-title"
            className="landing-title"
            aria-label="Aptitude is governed skill infrastructure for reusable agent capabilities."
          >
            <TextType
              as="span"
              text={heroPhrases}
              typingSpeed={46}
              deletingSpeed={24}
              initialDelay={280}
              pauseDuration={2600}
              showCursor
              cursorCharacter="▎"
              cursorClassName="landing-title__cursor"
              variableSpeed={{ min: 34, max: 76 }}
            />
          </h1>

          <div className="landing-hero__body">
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
              <a
                className="landing-button landing-button--secondary"
                href="https://github.com/aptitude-stack"
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs
              </a>
            </div>
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
        className="landing-section landing-section--stack landing-settle"
        aria-labelledby="solution-title"
      >
        <div className="landing-section__intro">
          <p className="eyebrow">The Solution</p>
          <h2 id="solution-title">Audit, govern, and compose approved skills.</h2>
          <p>
            Aptitude turns team knowledge into audited, benchmarked, immutable
            skill versions that can be discovered, composed, locked, and
            installed under policy.
          </p>
        </div>
        <div className="landing-solution-flow" aria-label="Audit Govern Compose solution pipeline">
          {solutionControls.map((control) => (
            <article className="landing-solution-node" key={control.step}>
              <div className="landing-solution-node__marker">
                <Badge variant="secondary" className="landing-solution-node__step">
                  {control.step}
                </Badge>
              </div>
              <span>{control.label}</span>
              <h3>{control.title}</h3>
              <p>{control.text}</p>
            </article>
          ))}
        </div>
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
          <h2 id="audience-title">One capability layer for systems, users, and agents.</h2>
          <p>
            Aptitude connects the operators who govern skills, the people using
            agents, and the agents that need dependable capability discovery at
            runtime.
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
        <SystemCompositionDiagram />
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
          <a
            className="landing-button landing-button--secondary"
            href="https://github.com/aptitude-stack"
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </a>
        </div>
      </section>
    </div>
  );
}
