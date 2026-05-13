import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"

interface SkillContentProps {
  markdown: string
  truncated?: boolean
}

export function SkillContent({ markdown, truncated }: SkillContentProps) {
  return (
    <div>
      <div className="prose-skill">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {markdown}
        </ReactMarkdown>
      </div>
      {truncated && (
        <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontFamily: "IBM Plex Mono, monospace", marginTop: "1rem", textAlign: "center" }}>
          content truncated — full version available via CLI
        </p>
      )}
    </div>
  )
}
