import type { SVGProps } from "react"

interface StarIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean
}

export function StarIcon({ filled = false, ...props }: StarIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 17.75 5.83 21l1.18-6.88L2.01 9.25l6.9-1L12 2l3.09 6.25 6.9 1-5 4.87L18.17 21 12 17.75Z" />
    </svg>
  )
}
