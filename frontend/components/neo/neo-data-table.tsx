"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { neoColumns } from "@/components/neo/neo-columns";
import type { NeoObject } from "@/lib/services/neo";

interface NeoDataTableProps {
  data: NeoObject[];
}

export function NeoDataTable({ data }: NeoDataTableProps) {
  const { table } = useDataTable({
    columns: neoColumns,
    data,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
