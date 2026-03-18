import { PropsWithChildren } from "react"
import Markdown from "react-markdown"

interface MarkdownWrapperProps extends PropsWithChildren {}
export function MarkdownWrapper({ children }: MarkdownWrapperProps) {
  return (
    <Markdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => <h2 className="text-lg font-bold">{children}</h2>,
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="ml-4 list-[square]">{children}</ul>
        ),
      }}
    >
      {`${children}`}
    </Markdown>
  )
}
