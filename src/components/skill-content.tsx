import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { cleanSkillMarkdown } from "@/lib/skill-markdown"

interface SkillContentProps {
  markdown: string
}

export function SkillContent({ markdown }: SkillContentProps) {
  return (
    <div className="prose-skill">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {cleanSkillMarkdown(markdown)}
      </ReactMarkdown>
    </div>
  )
}
