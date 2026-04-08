import { PropsWithChildren } from "react"
import { Button } from "../ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { cn } from "@/lib/utils"

interface FeatureCardProps extends PropsWithChildren {
  title: string
  source?: HomePageSource
  actions?: React.ReactNode
  links?: React.ReactNode
}

interface HomePageSource {
  label: string
  url: string
}

export function FeatureCard({
  title,
  children,
  source,
  actions,
  links,
}: FeatureCardProps) {
  return (
    <Card className="max-w-220">
      <CardHeader className="flex flex-col md:flex-row">
        <CardTitle className="flex w-full text-xl">{title}</CardTitle>
        {actions && <CardAction className="w-full">{actions}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
      {source || links ? (
        <CardFooter
          className={cn(
            "flex flex-row items-end gap-2",
            !source || !links ? "justify-end" : "justify-between"
          )}
        >
          {source && (
            <div className="text-muted-foreground">
              <a href={source.url} target="_blank">
                Source: {source.label}
              </a>
            </div>
          )}
          {links ? links : <></>}
        </CardFooter>
      ) : (
        <></>
      )}
    </Card>
  )
}
