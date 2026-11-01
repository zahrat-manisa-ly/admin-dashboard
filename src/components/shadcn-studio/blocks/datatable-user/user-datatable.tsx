"use client";

import { type ReactNode, useMemo } from "react";

import { type ColumnDef, useTable } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";
import { type DataTableFeatures, dataTableFeatures } from "@/lib/data-table-features";
import { cn, getInitials } from "@/lib/utils";

export type DirectoryStatusTone = "success" | "pending" | "danger" | "muted";

export type DirectoryRow = {
  id: string;
  name: string;
  email: string;
  detail: string;
  extra: string;
  statusLabel: string;
  statusTone: DirectoryStatusTone;
  actions?: ReactNode;
};

type UserDatatableProps = {
  rows: DirectoryRow[];
  page: number;
  pageSize: number;
  total: number;
  pages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  formatNumber: (value: number) => string;
  headers: {
    person: string;
    detail: string;
    extra: string;
    status: string;
    actions: string;
  };
  labels: {
    showing: string;
    previous: string;
    next: string;
    rowsPerPage: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  showActions?: boolean;
};

const toneClass: Record<DirectoryStatusTone, string> = {
  success: "border-none bg-success/15 text-success",
  pending: "border-none bg-secondary text-secondary-foreground",
  danger: "",
  muted: "",
};

export function UserDatatable({
  rows,
  page,
  pageSize,
  total,
  pages,
  onPageChange,
  onPageSizeChange,
  formatNumber,
  headers,
  labels,
  showActions = false,
}: UserDatatableProps) {
  const columns = useMemo<ColumnDef<DataTableFeatures, DirectoryRow>[]>(
    () => [
      {
        id: "person",
        header: headers.person,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="size-9">
              <AvatarFallback className="text-xs">{getInitials(row.original.name).slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{row.original.name}</span>
              <span className="truncate text-muted-foreground" dir="ltr">
                {row.original.email || "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "detail",
        header: headers.detail,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.detail || "—"}</span>,
      },
      {
        id: "extra",
        header: headers.extra,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.extra || "—"}</span>,
      },
      {
        id: "status",
        header: headers.status,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.statusTone === "danger"
                ? "destructive"
                : row.original.statusTone === "muted"
                  ? "outline"
                  : "secondary"
            }
            className={cn("capitalize", toneClass[row.original.statusTone])}
          >
            {row.original.statusLabel}
          </Badge>
        ),
      },
      ...(showActions
        ? [
            {
              id: "actions",
              header: headers.actions,
              cell: ({ row }) => <div className="flex justify-end">{row.original.actions}</div>,
            } satisfies ColumnDef<DataTableFeatures, DirectoryRow>,
          ]
        : []),
    ],
    [headers, showActions],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: rows,
    columns,
    getRowId: (row) => row.id,
    state: { pagination: { pageIndex: 0, pageSize: Math.max(rows.length, 1) } },
  });

  const pageCount = Math.max(pages, 1);
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const {
    pages: pageItems,
    showLeftEllipsis,
    showRightEllipsis,
  } = usePagination({
    currentPage,
    totalPages: pageCount,
    paginationItemsToDisplay: 3,
  });
  const rowStart = rows.length ? (currentPage - 1) * pageSize + 1 : 0;
  const rowEnd = rows.length ? rowStart + rows.length - 1 : 0;

  return (
    <div className="w-full">
      <div className="border-b">
        {rows.length ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="h-14 border-t">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-muted-foreground first:ps-4 last:pe-4 last:text-end">
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="h-14 first:ps-4 last:pe-4">
                      {<table.FlexRender cell={cell} />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty className="min-h-48 border-t">
            <EmptyHeader>
              <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
              <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="whitespace-nowrap text-muted-foreground text-sm" aria-live="polite">
          {labels.showing
            .replace("{start}", formatNumber(rowStart))
            .replace("{end}", formatNumber(rowEnd))
            .replace("{total}", formatNumber(total))}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{labels.rowsPerPage}</span>
            <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger size="sm" className="w-20" aria-label={labels.rowsPerPage}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectGroup>
                  {[5, 10, 25, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {formatNumber(size)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label={labels.previous}
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                  {labels.previous}
                </Button>
              </PaginationItem>
              {showLeftEllipsis ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              {pageItems.map((item) => (
                <PaginationItem key={item}>
                  <Button
                    size="icon"
                    variant={item === currentPage ? "outline" : "ghost"}
                    onClick={() => onPageChange(item)}
                    aria-current={item === currentPage ? "page" : undefined}
                  >
                    {formatNumber(item)}
                  </Button>
                </PaginationItem>
              ))}
              {showRightEllipsis ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <Button
                  variant="ghost"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= pageCount}
                  aria-label={labels.next}
                >
                  {labels.next}
                  <ChevronRightIcon data-icon="inline-end" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
