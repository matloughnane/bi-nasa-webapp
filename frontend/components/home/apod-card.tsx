"use client"
import { Download, Loader2, CalendarIcon } from "lucide-react"
import { Button } from "../ui/button"
import { FeatureCard } from "./feature-card"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { fetchApod } from "@/lib/services/apod"
import Link from "next/link"

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function APODCard() {
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)

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
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-48 justify-start text-left",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateStr}
              </Button>
            </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d)
                  setOpen(false)
                }
              }}
              disabled={{ after: new Date(), before: new Date("1995-06-16") }}
              defaultMonth={date}
            />
          </PopoverContent>
        </Popover>
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
        ) : <></>
      }
    >
      {isLoading && (
        <div className="flex w-full flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}
      {error && !apod && (
        <p className="text-center text-destructive">Unable to load the image</p>
      )}
      {apod && (
        <div className="flex flex-col gap-3">
          {apod.media_type === "image" ? (
            <img
              src={apod.url}
              alt={apod.title}
              className="w-full object-cover"
            />
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
