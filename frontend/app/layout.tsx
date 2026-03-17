import type { Metadata } from "next"
import { Geist, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: {
    default: "NASA Dashboard | Matthew Loughnane",
    template: "%s | NASA Dashboard",
  },
  description:
    "Explore near-earth objects, solar flares, and NASA's Astronomy Picture of the Day. Built with Next.js and the NASA Open API.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "NASA Dashboard | Matthew Loughnane",
    description:
      "Explore near-earth objects, solar flares, and NASA's Astronomy Picture of the Day.",
    images: [{ url: "/nasa-meta.png", width: 5000, height: 2625 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NASA Dashboard | Matthew Loughnane",
    description:
      "Explore near-earth objects, solar flares, and NASA's Astronomy Picture of the Day.",
    images: ["/nasa-meta.png"],
  },
  icons: { icon: "/nasa-meta.png" },
}

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-mono",
        jetbrainsMono.variable
      )}
    >
      <body>
        <TooltipProvider>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
