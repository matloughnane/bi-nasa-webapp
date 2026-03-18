"use client"
import { Download, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { FeatureCard } from "../home/feature-card"
import { DatePicker } from "../ui/date-picker"
import { useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { fetchApod } from "@/lib/services/apod"
import { Skeleton } from "../ui/skeleton"
import Link from "next/link"
import { formatDate } from "@/lib/format"

export function APODCard() {
  const [date, setDate] = useState<Date>(new Date())
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageLoad = useCallback(() => setImageLoaded(true), [])

  const dateStr = formatDate(date)
  const {
    data: apod,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["apod", dateStr],
    queryFn: () => fetchApod(dateStr),
    placeholderData: (prev) => prev,
  })

  return (
    <FeatureCard
      title="Astronomy Picture of the Day"
      source={{
        url: "https://github.com/nasa/apod-api",
        label: "NASA APOD API",
      }}
      actions={
        <div className="flex items-center gap-2">
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
          )}
          <DatePicker
            label="Date"
            date={date}
            onSelect={(d) => {
              setDate(d)
              setImageLoaded(false)
            }}
            disabledBefore={new Date("1995-06-16")}
            disabledAfter={new Date()}
          />
        </div>
      }
      links={
        apod?.hdurl || apod?.url ? (
          <Button size="lg" variant="default" asChild>
            <Link
              href={apod.hdurl || apod.url}
              target="_blank"
              rel="noopener noreferrer"
              className=""
              download
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Link>
          </Button>
        ) : (
          <></>
        )
      }
    >
      {isLoading && (
        <div className="flex w-full flex-col items-center gap-2 text-muted-foreground" role="status" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Loading astronomy picture...</span>
        </div>
      )}
      {error && !apod && (
        <p className="text-center text-destructive" role="alert">Unable to load the image</p>
      )}
      {apod && (
        <div className="flex flex-col gap-3">
          {apod.media_type === "image" ? (
            <div className="relative">
              {!imageLoaded && <Skeleton className="aspect-video w-full" />}
              <img
                src={apod.url}
                alt={apod.title}
                className={cn("w-full object-cover", !imageLoaded && "hidden")}
                onLoad={handleImageLoad}
              />
            </div>
          ) : (
            <iframe
              src={apod.url}
              title={apod.title}
              className="aspect-video w-full"
              allowFullScreen
            />
          )}
          <p className="text-lg font-medium">{apod.title}</p>
          <p className="text-muted-foreground">{apod.explanation}</p>
        </div>
      )}
    </FeatureCard>
  )
}
