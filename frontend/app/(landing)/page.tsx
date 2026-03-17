import { Logo } from "@/components/common/logo"
import { APODCard } from "@/components/home/apod-card"
import { FeatureCard } from "@/components/home/feature-card"
import { LandingHeader } from "@/components/landing/landing-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex w-full min-w-0 flex-col items-center gap-4 text-sm leading-loose">
        <LandingHeader title={"Matthew Loughnane | NASA Webapp"} />
        <div className="flex flex-col gap-4">
          <FeatureCard
            title={"Near Earth Objects"}
            source={{
              url: "https://api.nasa.gov/",
              label: "NASA API",
            }}
            links={
              <div className="flex flex-row gap-2">
                <Link href="/near-earth-objects">
                  <Button size={"lg"} variant={"default"}>
                    View Dashboard
                  </Button>
                </Link>
              </div>
            }
          >
            <p>
              Returns a week's worth of asteroid close-approach data. Each
              object includes its name, estimated diameter, miss distance,
              relative velocity, and whether it's flagged as potentially
              hazardous.
            </p>
          </FeatureCard>
          <FeatureCard
            title={"Solar Flares [DONKI]"}
            source={{
              url: "https://api.nasa.gov/#browseAPI",
              label: "Asteroids - NeoWs",
            }}
            links={
              <Link href="/solar-flares">
                <Button size={"lg"} variant={"default"}>
                  View Dashboard
                </Button>
              </Link>
            }
          >
            <p>
              Returns solar flare events with peak time, class type (A/B/C/M/X
              scale), and source location on the sun. This feeds the chart and
              the event table.
            </p>
          </FeatureCard>
          <APODCard />
        </div>
      </div>
    </div>
  )
}
