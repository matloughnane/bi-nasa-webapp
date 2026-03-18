"use client"

import type { PaginationState } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableExport } from "@/components/data-table/data-table-export"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { flrColumns } from "@/components/flr/flr-columns"
import type { FlrEvent } from "@/lib/services/flr"

interface FlrDataTableProps {
  data: FlrEvent[]
  pageCount: number
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
}

export function FlrDataTable({
  data,
  pageCount,
  pagination,
  onPaginationChange,
}: FlrDataTableProps) {
  const { table } = useDataTable({
    columns: flrColumns,
    data,
    manualPagination: true,
    pageCount,
    pagination,
    onPaginationChange,
  })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <DataTableExport table={table} filename="solar-flares" />
      </DataTableToolbar>
    </DataTable>
  )
}
