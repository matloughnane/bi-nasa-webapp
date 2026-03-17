"use client"

import { useQuery } from "@tanstack/react-query"
import { addDays, format, subDays } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"

import { NeoChart } from "@/components/neo/neo-chart"
import { NeoDataTable } from "@/components/neo/neo-data-table"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { fetchNeo } from "@/lib/services/neo"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"

function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export default function NearEarthObjectsPage() {
  const today = new Date()
  const [startDate, setStartDate] = React.useState<Date>(subDays(today, 7))
  const [endDate, setEndDate] = React.useState<Date>(today)

  const handleStartDateChange = (date: Date) => {
    setStartDate(date)
    setEndDate(addDays(date, 7))
  }

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["neo", formatDate(startDate), formatDate(endDate)],
    queryFn: () => fetchNeo(formatDate(startDate), formatDate(endDate)),
    placeholderData: (prev) => prev,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between lg:flex-row lg:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Near Earth Objects
          </h1>
          <p className="text-sm text-muted-foreground">
            Asteroid close-approach data from NASA&apos;s NeoWs API.
          </p>
        </div>

        <div className="flex flex-col pt-2">
          <div className="flex items-center gap-2">
            <DatePicker
              label="Start date"
              date={startDate}
              onSelect={handleStartDateChange}
              disabledAfter={today}
            />
            <DatePicker
              label="End date"
              date={endDate}
              onSelect={setEndDate}
              disabledBefore={addDays(startDate, 1)}
              disabledAfter={addDays(startDate, 7)}
            />
          </div>
          <span className="pt-2 text-xs text-muted-foreground">
            Note: This API is limited to 7 days
          </span>
        </div>
      </div>

      {isLoading && !data && (
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          Loading asteroid data...
        </div>
      )}

      {isError && !data && (
        <div className="flex h-24 items-center justify-center text-sm text-destructive">
          Failed to load data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {data && (
        <div className={cn("flex flex-col gap-4", isFetching && "opacity-50 transition-opacity")}>
          <NeoChart data={data} />
          <NeoDataTable data={data} />
        </div>
      )}
    </div>
  )
}
