import type { Metadata } from "next"
import Markdown from "react-markdown"
import { FeatureCard } from "@/components/home/feature-card"
import { LandingHeader } from "@/components/landing/landing-header"
import { Button } from "@/components/ui/button"
import { MarkdownWrapper } from "@/components/common/react-wrapper"
import { aboutContent } from "@/content/about"

export const metadata: Metadata = {
  title: "About",
  description:
    "About this NASA Dashboard submission by Matthew Loughnane for the Bounce Insights coding challenge.",
}

export default function AboutPage() {
  return (
    <div className="flex p-6">
      <div className="flex w-full min-w-0 flex-col items-center gap-4 text-sm leading-loose">
        <LandingHeader title={"About | NASA Webapp"} />
        <div className="flex flex-col gap-4">
          <FeatureCard
            title={"The Project"}
            links={
              <div className="flex flex-row gap-2">
                <Button size={"lg"} variant={"default"}>
                  My CV
                </Button>
              </div>
            }
          >
            <MarkdownWrapper>{aboutContent}</MarkdownWrapper>
          </FeatureCard>
        </div>
      </div>
    </div>
  )
}
