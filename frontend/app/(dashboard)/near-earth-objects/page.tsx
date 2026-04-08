"use client"

import type { PaginationState } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import { addDays, eachDayOfInterval, format, subDays } from "date-fns"
import { useMemo, useState } from "react"

import { Info, Loader2 } from "lucide-react"
import { NeoChart } from "@/components/neo/neo-chart"
import { NeoDataTable } from "@/components/neo/neo-data-table"
import { FacetedFilter } from "@/components/ui/faceted-filter"
import { DatePicker } from "@/components/ui/date-picker"
import { fetchNeo, fetchNeoAll, type NeoObject } from "@/lib/services/neo"
import { AiSummary } from "@/components/dashboard/ai-summary"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

function computeHazardCounts(
  start: Date,
  end: Date,
  filteredData: NeoObject[]
) {
  const allDates = eachDayOfInterval({ start, end }).map((d) =>
    format(d, "yyyy-MM-dd")
  )

  const safeMap = new Map<string, number>()
  const hazardousMap = new Map<string, number>()

  for (const obj of filteredData) {
    const date = obj.close_approach_date
    if (obj.is_potentially_hazardous) {
      hazardousMap.set(date, (hazardousMap.get(date) ?? 0) + 1)
    } else {
      safeMap.set(date, (safeMap.get(date) ?? 0) + 1)
    }
  }

  return {
    safeCounts: allDates.map((date) => ({
      date,
      count: safeMap.get(date) ?? 0,
    })),
    hazardousCounts: allDates.map((date) => ({
      date,
      count: hazardousMap.get(date) ?? 0,
    })),
  }
}

export default function NearEarthObjectsPage() {
  const [today] = useState(() => new Date())
  const [startDate, setStartDate] = useState<Date>(() => subDays(new Date(), 7))
  const [endDate, setEndDate] = useState<Date>(() => new Date())
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 30,
  })

  const [hazardousFilter, setHazardousFilter] = useState<Set<string>>(new Set())

  const handleStartDateChange = (date: Date) => {
    setStartDate(date)
    setEndDate(addDays(date, 7))
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  // Paginated query for the table
  const {
    data: result,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [
      "neo",
      formatDate(startDate),
      formatDate(endDate),
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      fetchNeo(
        formatDate(startDate),
        formatDate(endDate),
        pagination.pageIndex + 1,
        pagination.pageSize
      ),
    placeholderData: (prev) => prev,
  })

  // Non-paginated query for the chart
  const {
    data: allData,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
  } = useQuery({
    queryKey: ["neo-all", formatDate(startDate), formatDate(endDate)],
    queryFn: () => fetchNeoAll(formatDate(startDate), formatDate(endDate)),
    placeholderData: (prev) => prev,
  })

  const pageData = result?.data ?? []
  const pageCount = result ? Math.ceil(result.total / pagination.pageSize) : 0

  const filteredTableData = useMemo(() => {
    if (hazardousFilter.size === 0) return pageData
    return pageData.filter((d) => {
      const val = d.is_potentially_hazardous ? "true" : "false"
      return hazardousFilter.has(val)
    })
  }, [pageData, hazardousFilter])

  const filteredChartData = useMemo(() => {
    const all = allData ?? []
    if (hazardousFilter.size === 0) return all
    return all.filter((d) => {
      const val = d.is_potentially_hazardous ? "true" : "false"
      return hazardousFilter.has(val)
    })
  }, [allData, hazardousFilter])

  const hazardousOptions = useMemo(() => {
    const all = allData ?? []
    const safe = all.filter((d) => !d.is_potentially_hazardous).length
    const hazardous = all.filter((d) => d.is_potentially_hazardous).length
    return [
      { label: "Safe", value: "false", count: safe },
      { label: "Hazardous", value: "true", count: hazardous },
    ]
  }, [allData])

  const { safeCounts, hazardousCounts } = useMemo(
    () => computeHazardCounts(startDate, endDate, filteredChartData),
    [startDate, endDate, filteredChartData]
  )

  const includesProjectedData = endDate > today

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader
        title="Near Earth Objects"
        description={`Asteroid close-approach data from NASA's NeoWs API.`}
        actions={
          <div className="flex flex-col md:flex-row items-end gap-2">
            <FacetedFilter
              title="Hazardous"
              options={hazardousOptions}
              value={hazardousFilter}
              onValueChange={setHazardousFilter}
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
              onSelect={setEndDate}
              disabledBefore={addDays(startDate, 1)}
              disabledAfter={addDays(startDate, 7)}
            />
          </div>
        }
        isLoading={isFetching}
      />

      <div aria-live="polite" role="status">
        {(isLoading || isLoadingAll) && !result && (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Loading asteroid data...
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
          aria-busy={isFetching || isFetchingAll}
          className={cn(
            "flex flex-col gap-4",
            (isFetching || isFetchingAll) && "opacity-50 transition-opacity"
          )}
        >
          {includesProjectedData && (
            <div className="flex w-full flex-row justify-center rounded-none border border-red-200 bg-red-50 px-4 py-2 text-center text-xs text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-white">
              <span>** Results include projected data **</span>
            </div>
          )}
          <NeoChart safeCounts={safeCounts} hazardousCounts={hazardousCounts} />
          <AiSummary
            type="neo"
            startDate={formatDate(startDate)}
            endDate={formatDate(endDate)}
          />
          <NeoDataTable
            data={filteredTableData}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </div>
      )}
    </div>
  )
}
