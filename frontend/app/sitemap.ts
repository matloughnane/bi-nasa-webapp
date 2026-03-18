import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.5 },
    { url: `${baseUrl}/near-earth-objects`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/solar-flares`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/apod`, lastModified: new Date(), priority: 0.7 },
  ]
}
