"use client";

import {
  DatabaseZap,
  GitBranch,
  Monitor,
  PackageCheck,
  SearchCheck,
  Users,
  Warehouse,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const nodes = {
  author: {
    label: "Skill Author / CI",
    icon: GitBranch,
    description: "The team or automation that prepares skill changes for release.",
  },
  publisher: {
    label: "Publisher",
    detail: "authoring + release",
    icon: PackageCheck,
    description: "Packages, validates, and releases skills as governed artifacts.",
  },
  registry: {
    label: "Registry",
    detail: "discovery + fetch + governance",
    icon: Warehouse,
    description: "Stores immutable skill versions, metadata, relationships, policies, and exact content fetches.",
  },
  web: {
    label: "Web App",
    detail: "catalog + operations",
    icon: Monitor,
    description: "Catalog and operational UI backed by server-side registry fetches.",
  },
  resolver: {
    label: "Resolver",
    detail: "search + solve + planning",
    icon: SearchCheck,
    description: "Finds governed skills, solves for the right package, and plans repeatable agent capability use.",
  },
  user: {
    label: "User",
    detail: "CLI / MCP",
    icon: Users,
    description: "The human or agent-facing runtime consumer reached through CLI and MCP surfaces.",
  },
  db: {
    label: "PostgreSQL",
    icon: DatabaseZap,
    description: "Registry persistence for catalog metadata, policy state, relationships, and governance records.",
  },
};

function DiagramNode({ id }: { id: keyof typeof nodes }) {
  const node = nodes[id];
  const Icon = node.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className={`composition-node composition-node--${id}`} type="button">
          <Icon aria-hidden="true" className="composition-node__icon" />
          <span className="composition-node__text">
            <span className="composition-node__label">{node.label}</span>
            {"detail" in node ? (
              <span className="composition-node__detail">{node.detail}</span>
            ) : null}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="composition-tooltip">
        {node.description}
      </TooltipContent>
    </Tooltip>
  );
}

export function SystemCompositionDiagram() {
  return (
    <TooltipProvider>
      <div className="composition-diagram-scroll">
        <div className="composition-diagram" aria-label="Aptitude system composition diagram">
          <svg
            className="composition-edges"
            viewBox="0 0 1000 640"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="composition-arrow-start"
                viewBox="0 0 10 10"
                refX="2"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 10 0 L 0 5 L 10 10 z" />
              </marker>
              <marker
                id="composition-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
            <path d="M 500 88 L 500 141" markerEnd="url(#composition-arrow)" />
            <path d="M 500 215 L 500 261" markerEnd="url(#composition-arrow)" />
            <path d="M 365 335 C 330 335 320 455 274 455" markerEnd="url(#composition-arrow)" />
            <path d="M 500 383 L 500 416" markerEnd="url(#composition-arrow)" />
            <path d="M 500 490 L 500 531" markerEnd="url(#composition-arrow)" />
            <path
              d="M 639 354 C 700 354 700 440 741 440"
              markerStart="url(#composition-arrow-start)"
              markerEnd="url(#composition-arrow)"
            />
          </svg>

          <DiagramNode id="author" />
          <DiagramNode id="publisher" />
          <DiagramNode id="registry" />
          <DiagramNode id="web" />
          <DiagramNode id="resolver" />
          <DiagramNode id="user" />
          <DiagramNode id="db" />
        </div>
      </div>
    </TooltipProvider>
  );
}
