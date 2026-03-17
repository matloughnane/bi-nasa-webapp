"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import type { NeoObject } from "@/lib/services/neo"

export const neoColumns: ColumnDef<NeoObject>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Name" />
    ),
    cell: ({ row }) => (
      <span className="max-w-50 truncate font-medium">
        {row.getValue("name")}
      </span>
    ),
    meta: { label: "Name", variant: "text", placeholder: "Search by name..." },
    enableColumnFilter: true,
  },
  {
    id: "close_approach_date",
    accessorKey: "close_approach_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Close Approach Date" />
    ),
    meta: { label: "Close Approach Date" },
  },
  {
    id: "estimated_diameter_min_km",
    accessorKey: "estimated_diameter_min_km",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Est. Diameter Min (km)" />
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>("estimated_diameter_min_km")
      return <span>{value.toFixed(4)}</span>
    },
    meta: { label: "Est. Diameter Min (km)" },
  },
  {
    id: "estimated_diameter_max_km",
    accessorKey: "estimated_diameter_max_km",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Est. Diameter Max (km)" />
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>("estimated_diameter_max_km")
      return <span>{value.toFixed(4)}</span>
    },
    meta: { label: "Est. Diameter Max (km)" },
  },
  {
    id: "miss_distance_km",
    accessorKey: "miss_distance_km",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Miss Distance (km)" />
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>("miss_distance_km")
      return (
        <span>
          {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      )
    },
    meta: { label: "Miss Distance (km)" },
  },
  {
    id: "relative_velocity_kmph",
    accessorKey: "relative_velocity_kmph",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Velocity (km/h)" />
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>("relative_velocity_kmph")
      return (
        <span>
          {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      )
    },
    meta: { label: "Velocity (km/h)" },
  },
  {
    id: "is_potentially_hazardous",
    accessorKey: "is_potentially_hazardous",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Hazardous" />
    ),
    cell: ({ row }) => {
      const hazardous = row.getValue<boolean>("is_potentially_hazardous")
      return (
        <Badge variant={hazardous ? "destructive" : "secondary"}>
          {hazardous ? "Yes" : "No"}
        </Badge>
      )
    },
    meta: {
      label: "Hazardous",
      variant: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true
      const cellValue = String(row.getValue(columnId))
      return filterValue.includes(cellValue)
    },
  },
]
