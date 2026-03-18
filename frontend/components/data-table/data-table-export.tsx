"use client"

import type { Table } from "@tanstack/react-table"
import { Download } from "lucide-react"
import { useCallback } from "react"

import { Button } from "@/components/ui/button"

interface DataTableExportProps<TData> {
  table: Table<TData>
  filename?: string
}

export function DataTableExport<TData>({
  table,
  filename = "export",
}: DataTableExportProps<TData>) {
  const handleExport = useCallback(() => {
    const headers = table
      .getVisibleFlatColumns()
      .filter((col) => typeof col.accessorFn !== "undefined")

    const headerRow = headers
      .map((col) => `"${col.columnDef.meta?.label ?? col.id}"`)
      .join(",")

    const rows = table.getFilteredRowModel().rows.map((row) =>
      headers
        .map((col) => {
          const value = row.getValue(col.id)
          if (value === null || value === undefined) return ""
          const str = String(value)
          return `"${str.replace(/"/g, '""')}"`
        })
        .join(","),
    )

    const csv = [headerRow, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [table, filename])

  return (
    <Button
      aria-label="Export to CSV"
      variant="outline"
      size="sm"
      className="h-8 font-normal"
      onClick={handleExport}
    >
      <Download className="text-muted-foreground" />
      Export
    </Button>
  )
}
