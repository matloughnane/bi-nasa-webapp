"use client"

import type { PaginationState } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableExport } from "@/components/data-table/data-table-export"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { neoColumns } from "@/components/neo/neo-columns"
import type { NeoObject } from "@/lib/services/neo"

interface NeoDataTableProps {
  data: NeoObject[]
  pageCount: number
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
}

export function NeoDataTable({
  data,
  pageCount,
  pagination,
  onPaginationChange,
}: NeoDataTableProps) {
  const { table } = useDataTable({
    columns: neoColumns,
    data,
    manualPagination: true,
    pageCount,
    pagination,
    onPaginationChange,
  })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <DataTableExport table={table} filename="near-earth-objects" />
      </DataTableToolbar>
    </DataTable>
  )
}
