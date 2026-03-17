import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Solar Flares",
  description:
    "Browse solar flare events with class type, peak time, and source location from NASA's DONKI API.",
}

export default function SolarFlaresLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
