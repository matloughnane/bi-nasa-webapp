"use client"

import type { PaginationState } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import { addDays, format, subDays } from "date-fns"
import { useMemo, useState } from "react"

import { Loader2 } from "lucide-react"
import { FlrChart } from "@/components/flr/flr-chart"
import { FlrDataTable } from "@/components/flr/flr-data-table"
import { DatePicker } from "@/components/ui/date-picker"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import { fetchFlr } from "@/lib/services/flr"
import { AiSummary } from "@/components/dashboard/ai-summary"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function SolarFlaresPage() {
  const [today] = useState(() => new Date())
  const [startDate, setStartDate] = useState<Date>(() =>
    subDays(new Date(), 30)
  )
  const [endDate, setEndDate] = useState<Date>(() => new Date())
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 30,
  })
  const [classFilter, setClassFilter] = useState<Set<string>>(new Set())

  const handleStartDateChange = (date: Date) => {
    setStartDate(date)
    if (date > endDate) {
      setEndDate(date)
    }
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleEndDateChange = (date: Date) => {
    setEndDate(date)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const {
    data: result,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [
      "flr",
      formatDate(startDate),
      formatDate(endDate),
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      fetchFlr(
        formatDate(startDate),
        formatDate(endDate),
        pagination.pageIndex + 1,
        pagination.pageSize
      ),
    placeholderData: (prev) => prev,
  })

  const pageData = result?.data ?? []
  const pageCount = result ? Math.ceil(result.total / pagination.pageSize) : 0

  const filteredData = useMemo(() => {
    if (classFilter.size === 0) return pageData
    return pageData.filter((d) => {
      const scale = d.class_type?.charAt(0).toUpperCase() ?? ""
      return classFilter.has(scale)
    })
  }, [pageData, classFilter])

  const classOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of pageData) {
      const scale = d.class_type?.charAt(0).toUpperCase() ?? ""
      counts.set(scale, (counts.get(scale) ?? 0) + 1)
    }
    return ["X", "M", "C", "B", "A"]
      .filter((s) => counts.has(s))
      .map((s) => ({ label: s, value: s, count: counts.get(s) }))
  }, [pageData])

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader
        title="Solar Flares"
        description={`Solar flare events from NASA's DONKI API.`}
        actions={
          <div className="flex flex-col items-end gap-2 md:flex-row">
            <FacetedFilter
              title="Class"
              options={classOptions}
              value={classFilter}
              onValueChange={setClassFilter}
            />
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
        }
        isLoading={isFetching}
      />

      <div aria-live="polite" role="status">
        {isLoading && !result && (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Loading solar flare data...
          </div>
        )}

        {isError && !result && (
          <div
            className="flex h-24 items-center justify-center text-sm text-destructive"
            role="alert"
          >
            Failed to load data:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        )}
      </div>

      {result && (
        <div
          aria-busy={isFetching}
          className={cn(
            "flex flex-col gap-4",
            isFetching && "opacity-50 transition-opacity"
          )}
        >
          <FlrChart data={filteredData} />
          <AiSummary
            type="flr"
            startDate={formatDate(startDate)}
            endDate={formatDate(endDate)}
          />
          <FlrDataTable
            data={filteredData}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </div>
      )}
    </div>
  )
}
