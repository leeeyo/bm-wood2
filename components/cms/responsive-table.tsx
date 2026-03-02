"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

export interface Column<T> {
  /** Unique key for the column */
  key: string;
  /** Header text */
  header: string;
  /** Cell renderer */
  cell: (item: T, index: number) => React.ReactNode;
  /** Optional className for the header */
  headerClassName?: string;
  /** Optional className for the cell */
  cellClassName?: string;
  /** Whether to hide this column on mobile (defaults to false) */
  hideOnMobile?: boolean;
  /** Whether this is a primary column (shown prominently in card view) */
  isPrimary?: boolean;
  /** Label to show in card view (if different from header) */
  mobileLabel?: string;
}

export interface ResponsiveTableProps<T> {
  /** Data to display */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Function to get unique key for each row */
  getRowKey: (item: T, index: number) => string;
  /** Optional className for the table container */
  className?: string;
  /** Optional empty state component */
  emptyState?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Loading skeleton component */
  loadingSkeleton?: React.ReactNode;
  /** Optional action column renderer (always visible on mobile) */
  renderActions?: (item: T, index: number) => React.ReactNode;
  /** Optional card header renderer for mobile view */
  renderCardHeader?: (item: T, index: number) => React.ReactNode;
  /** Optional custom card renderer for complete control over mobile view */
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
}

export function ResponsiveTable<T>({
  data,
  columns,
  getRowKey,
  className,
  emptyState,
  isLoading,
  loadingSkeleton,
  renderActions,
  renderCardHeader,
  renderMobileCard,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (isLoading && loadingSkeleton) {
    return <>{loadingSkeleton}</>;
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((item, index) => {
          // Custom card renderer
          if (renderMobileCard) {
            return (
              <div key={getRowKey(item, index)}>
                {renderMobileCard(item, index)}
              </div>
            );
          }

          // Default card layout
          const primaryColumns = columns.filter((col) => col.isPrimary);
          const secondaryColumns = columns.filter(
            (col) => !col.isPrimary && !col.hideOnMobile
          );

          return (
            <Card key={getRowKey(item, index)} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Card Header */}
                {renderCardHeader ? (
                  <div className="mb-3">{renderCardHeader(item, index)}</div>
                ) : (
                  primaryColumns.length > 0 && (
                    <div className="mb-3 pb-3 border-b">
                      {primaryColumns.map((col) => (
                        <div key={col.key} className={col.cellClassName}>
                          {col.cell(item, index)}
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Secondary columns as key-value pairs */}
                <div className="space-y-2 text-sm">
                  {secondaryColumns.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="text-muted-foreground shrink-0">
                        {col.mobileLabel || col.header}
                      </span>
                      <div className={cn("text-right", col.cellClassName)}>
                        {col.cell(item, index)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {renderActions && (
                  <div className="mt-4 pt-3 border-t flex justify-end">
                    {renderActions(item, index)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Desktop table view with horizontal scroll
  return (
    <div className={cn("overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns
              .filter((col) => !col.hideOnMobile || !isMobile)
              .map((col) => (
                <TableHead key={col.key} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            {renderActions && (
              <TableHead className="w-[100px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={getRowKey(item, index)}>
              {columns
                .filter((col) => !col.hideOnMobile || !isMobile)
                .map((col) => (
                  <TableCell key={col.key} className={col.cellClassName}>
                    {col.cell(item, index)}
                  </TableCell>
                ))}
              {renderActions && (
                <TableCell>{renderActions(item, index)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * A wrapper component that adds horizontal scroll capability to tables
 */
export function ScrollableTableWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0",
        "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A simple mobile card component for data display
 */
export interface MobileDataCardProps {
  /** Card title/header */
  title: React.ReactNode;
  /** Optional subtitle */
  subtitle?: React.ReactNode;
  /** Optional image */
  image?: React.ReactNode;
  /** Key-value data pairs */
  data?: Array<{
    label: string;
    value: React.ReactNode;
  }>;
  /** Status badge */
  status?: React.ReactNode;
  /** Action buttons */
  actions?: React.ReactNode;
  /** Optional className */
  className?: string;
}

export function MobileDataCard({
  title,
  subtitle,
  image,
  data,
  status,
  actions,
  className,
}: MobileDataCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        {/* Header with image */}
        <div className="flex items-start gap-3 mb-3">
          {image && <div className="shrink-0">{image}</div>}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{title}</div>
            {subtitle && (
              <div className="text-sm text-muted-foreground truncate">
                {subtitle}
              </div>
            )}
          </div>
          {status && <div className="shrink-0">{status}</div>}
        </div>

        {/* Data rows */}
        {data && data.length > 0 && (
          <div className="space-y-2 text-sm border-t pt-3">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <div className="text-right">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="mt-3 pt-3 border-t flex justify-end gap-2">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
