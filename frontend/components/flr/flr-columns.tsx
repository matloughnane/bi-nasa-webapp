"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import type { FlrEvent } from "@/lib/services/flr"

function formatDateTime(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getClassScale(classType: string): string {
  if (!classType) return ""
  return classType.charAt(0).toUpperCase()
}

function getClassVariant(
  scale: string,
): "destructive" | "default" | "secondary" | "outline" {
  switch (scale) {
    case "X":
      return "destructive"
    case "M":
      return "default"
    default:
      return "secondary"
  }
}

export const flrColumns: ColumnDef<FlrEvent>[] = [
  {
    id: "class_type",
    accessorKey: "class_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Class" />
    ),
    cell: ({ row }) => {
      const classType = row.getValue<string>("class_type")
      const scale = getClassScale(classType)
      return (
        <Badge variant={getClassVariant(scale)} className="font-mono">
          {classType}
        </Badge>
      )
    },
    meta: {
      label: "Class",
      variant: "multiSelect",
      options: [
        { label: "X", value: "X" },
        { label: "M", value: "M" },
        { label: "C", value: "C" },
        { label: "B", value: "B" },
        { label: "A", value: "A" },
      ],
    },
    // enableColumnFilter: true,
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true
      const classType = row.getValue<string>(columnId)
      const scale = getClassScale(classType)
      return filterValue.includes(scale)
    },
  },
  {
    id: "begin_time",
    accessorKey: "begin_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Begin" />
    ),
    cell: ({ row }) => formatDateTime(row.getValue("begin_time")),
    meta: { label: "Begin" },
  },
  {
    id: "peak_time",
    accessorKey: "peak_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Peak" />
    ),
    cell: ({ row }) => formatDateTime(row.getValue("peak_time")),
    meta: { label: "Peak" },
  },
  {
    id: "end_time",
    accessorKey: "end_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="End" />
    ),
    cell: ({ row }) => formatDateTime(row.getValue("end_time")),
    meta: { label: "End" },
  },
  {
    id: "source_location",
    accessorKey: "source_location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Source Location" />
    ),
    cell: ({ row }) => (
      <span className="font-mono">
        {row.getValue<string>("source_location") || "—"}
      </span>
    ),
    meta: {
      label: "Source Location",
      variant: "text",
      placeholder: "Search location...",
    },
    // enableColumnFilter: true,
  },
  {
    id: "active_region_num",
    accessorKey: "active_region_num",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Active Region" />
    ),
    cell: ({ row }) => {
      const val = row.getValue<number | null>("active_region_num")
      return <span>{val ?? "—"}</span>
    },
    meta: { label: "Active Region" },
  },
  {
    id: "linked_events",
    accessorKey: "linked_events",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Linked Events" />
    ),
    cell: ({ row }) => {
      const count = row.getValue<number>("linked_events")
      return <span>{count}</span>
    },
    meta: { label: "Linked Events" },
  },
]
