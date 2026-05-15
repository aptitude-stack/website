import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { cleanSkillMarkdown } from "@/lib/skill-markdown"

interface SkillContentProps {
  markdown: string
}

export function SkillContent({ markdown }: SkillContentProps) {
  return (
    <div className="prose-skill" aria-labelledby="content-title">
      <div className="prose-skill__header">
        <h2 id="content-title" className="panel-title">Content</h2>
      </div>
      <div className="prose-skill__body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {cleanSkillMarkdown(markdown)}
        </ReactMarkdown>
      </div>
    </div>
  )
}
