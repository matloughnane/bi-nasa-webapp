import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState, useCallback, useMemo } from "react";

import type { ExtendedColumnSort } from "@/types/data-table";

interface UseDataTableProps<TData>
  extends Omit<
    TableOptions<TData>,
    | "state"
    | "pageCount"
    | "getCoreRowModel"
    | "manualFiltering"
    | "manualPagination"
    | "manualSorting"
    | "onPaginationChange"
  > {
  initialState?: Omit<Partial<TableState>, "sorting"> & {
    sorting?: ExtendedColumnSort<TData>[];
  };
  enableAdvancedFilter?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    columns,
    initialState,
    enableAdvancedFilter = false,
    manualPagination = false,
    pageCount,
    pagination: externalPagination,
    onPaginationChange: externalOnPaginationChange,
    ...tableProps
  } = props;

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialState?.rowSelection ?? {},
  );
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initialState?.columnVisibility ?? {});
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>(
    initialState?.sorting ?? [],
  );
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialState?.pagination?.pageSize ?? 10,
  });

  const pagination = externalPagination ?? internalPagination;

  const onPaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;
      if (externalOnPaginationChange) {
        externalOnPaginationChange(next);
      } else {
        setInternalPagination(next);
      }
    },
    [pagination, externalOnPaginationChange],
  );

  const onSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      setSorting((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue,
      );
    },
    [],
  );

  const onColumnFiltersChange = useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      setColumnFilters((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue,
      );
      if (externalOnPaginationChange) {
        externalOnPaginationChange({ ...pagination, pageIndex: 0 });
      } else {
        setInternalPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
    },
    [pagination, externalOnPaginationChange],
  );

  const table = useReactTable({
    ...tableProps,
    columns,
    initialState,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false,
    },
    enableRowSelection: true,
    manualPagination,
    ...(pageCount != null && { pageCount }),
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return useMemo(() => ({ table }), [table]);
}
