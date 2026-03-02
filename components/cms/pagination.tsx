"use client";

import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export interface PaginationState {
  page: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CMSPaginationProps {
  /** Current pagination state */
  pagination: PaginationState;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of pages to show on each side of current page */
  siblingCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the total count */
  showTotal?: boolean;
  /** Custom total count label */
  totalLabel?: string;
}

/**
 * Generates the page numbers array with ellipsis
 */
function generatePaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | "ellipsis")[] {
  // Always show first and last page
  // Show siblingCount pages on each side of current page
  
  const items: (number | "ellipsis")[] = [];
  
  if (totalPages <= 1) return items;
  
  // Calculate the range
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
  
  // Determine if we need ellipsis
  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;
  
  // Always add first page
  items.push(1);
  
  // Add left ellipsis
  if (showLeftEllipsis) {
    items.push("ellipsis");
  } else if (leftSiblingIndex === 2) {
    items.push(2);
  }
  
  // Add pages around current page
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      items.push(i);
    }
  }
  
  // Add right ellipsis
  if (showRightEllipsis) {
    items.push("ellipsis");
  } else if (rightSiblingIndex === totalPages - 1) {
    items.push(totalPages - 1);
  }
  
  // Always add last page if more than 1 page
  if (totalPages > 1) {
    items.push(totalPages);
  }
  
  return items;
}

export function CMSPagination({
  pagination,
  onPageChange,
  siblingCount = 1,
  className,
  showTotal = true,
  totalLabel = "élément",
}: CMSPaginationProps) {
  const { page, totalPages, total, hasNext, hasPrev } = pagination;
  
  const paginationItems = useMemo(
    () => generatePaginationItems(page, totalPages, siblingCount),
    [page, totalPages, siblingCount]
  );
  
  // Don't render if only one page
  if (totalPages <= 1 && !showTotal) return null;
  
  const pluralizedLabel = total !== 1 ? `${totalLabel}s` : totalLabel;
  
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4",
        className
      )}
    >
      {/* Total count */}
      {showTotal && (
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          {total} {pluralizedLabel} trouvé{total !== 1 ? "s" : ""}
        </p>
      )}
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <Pagination className="order-1 sm:order-2 mx-0 w-auto">
          <PaginationContent>
            {/* Previous button */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => hasPrev && onPageChange(page - 1)}
                className={cn(
                  !hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"
                )}
                aria-disabled={!hasPrev}
              />
            </PaginationItem>
            
            {/* Page numbers */}
            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    onClick={() => onPageChange(item)}
                    isActive={item === page}
                    className="cursor-pointer"
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            
            {/* Next button */}
            <PaginationItem>
              <PaginationNext
                onClick={() => hasNext && onPageChange(page + 1)}
                className={cn(
                  !hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"
                )}
                aria-disabled={!hasNext}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
