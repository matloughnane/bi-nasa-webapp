import type { Metadata } from "next"
import { FeatureCard } from "@/components/home/feature-card"
import { LandingHeader } from "@/components/landing/landing-header"
import { Button } from "@/components/ui/button"

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
            title={"About"}
            links={
              <div className="flex flex-row gap-2">
                <Button size={"lg"} variant={"default"}>
                  My CV
                </Button>
              </div>
            }
          >
            <p>
              Hi, I'm Matthew Loughnane - here's my submission for the
              {" "}<a href="https://www.bounceinsights.com/">Bounce Insights</a>{" "}
              coding challenge.
            </p>
            <h3 className="font-semibold">Frontend</h3>
            <ul>
              <li>
                Theme: I went with a simple squared theme based on the NASA worm
                logo.
              </li>
              <li>
                Design: I used{" "}
                <a href="https://tailwindcss.com/">TailwindCSS</a> with{" "}
                <a href="https://ui.shadcn.com/">ui.shadcn</a> components.
              </li>
              <li>
                Tech:{" "}
                <a href="https://tanstack.com/query/latest">Tanstack Query</a>,{" "}
                <a href="https://tanstack.com/table/latest">Tanstack Table</a>,{" "}
                <a href="https://www.diceui.com/docs/components/data-table">DiceUI Table</a>.
              </li>
            </ul>
            <h3 className="font-semibold">Backend</h3>
            <ul>
              <li>
                Theme: I went with a simple squared theme based on the NASA worm
                logo.
              </li>
              <li>
                Design: I used
                <a href="https://tailwindcss.com/">TailwindCSS</a> with
                <a href="https://ui.shadcn.com/">ui.shadcn</a> components.
              </li>
              <li>
                Tech:{" "}
                <a href="https://expressjs.com">ExpressJS</a>,{" "}
                <a href="https://helmetjs.github.io/">Helmet</a>,{" "}
                <a href="https://github.com/winstonjs/winston">Winston Logging</a>.
              </li>
            </ul>
            <h3 className="font-semibold">Tools</h3>
            <ul>
              <li>
                I used Claude Code to develop UI and generate boilerplate code.
              </li>
            </ul>
            <h3 className="font-semibold">Deployment</h3>
          </FeatureCard>
        </div>
      </div>
    </div>
  )
}
