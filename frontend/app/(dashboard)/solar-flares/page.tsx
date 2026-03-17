"use client"

import { useQuery } from "@tanstack/react-query"
import { addDays, format, subDays } from "date-fns"
import * as React from "react"

import { FlrDataTable } from "@/components/flr/flr-data-table"
import { DatePicker } from "@/components/ui/date-picker"
import { fetchFlr } from "@/lib/services/flr"
import { cn } from "@/lib/utils"

function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export default function SolarFlaresPage() {
  const today = new Date()
  const [startDate, setStartDate] = React.useState<Date>(subDays(today, 30))
  const [endDate, setEndDate] = React.useState<Date>(today)

  const handleStartDateChange = (date: Date) => {
    setStartDate(date)
    if (date > endDate) {
      setEndDate(date)
    }
  }

  const handleEndDateChange = (date: Date) => {
    setEndDate(date)
  }

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["flr", formatDate(startDate), formatDate(endDate)],
    queryFn: () => fetchFlr(formatDate(startDate), formatDate(endDate)),
    placeholderData: (prev) => prev,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between lg:flex-row lg:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Solar Flares</h1>
          <p className="text-sm text-muted-foreground">
            Solar flare events from NASA&apos;s DONKI API.
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
              onSelect={handleEndDateChange}
              disabledBefore={addDays(startDate, 1)}
              disabledAfter={today}
            />
          </div>
        </div>
      </div>

      {isLoading && !data && (
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          Loading solar flare data...
        </div>
      )}

      {isError && !data && (
        <div className="flex h-24 items-center justify-center text-sm text-destructive">
          Failed to load data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {data && (
        <div className={cn(isFetching && "opacity-50 transition-opacity")}>
          <FlrDataTable data={data} />
        </div>
      )}
    </div>
  )
}
