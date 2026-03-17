import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Near Earth Objects",
  description:
    "Browse asteroid close-approach data including estimated diameter, miss distance, velocity, and hazard status from NASA's NeoWs API.",
}

export default function NearEarthObjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
