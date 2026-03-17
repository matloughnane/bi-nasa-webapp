"use client"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { flrColumns } from "@/components/flr/flr-columns"
import type { FlrEvent } from "@/lib/services/flr"

interface FlrDataTableProps {
  data: FlrEvent[]
}

export function FlrDataTable({ data }: FlrDataTableProps) {
  const { table } = useDataTable({
    columns: flrColumns,
    data,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  )
}
