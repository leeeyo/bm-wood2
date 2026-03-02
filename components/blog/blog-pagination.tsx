"use client"

import Link from "next/link"

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
}

export function BlogPagination({
  currentPage,
  totalPages,
  hasPrev,
  hasNext,
}: BlogPaginationProps) {
  return (
    <div className="mt-12 flex justify-center gap-2">
      {hasPrev && (
        <Link
          href={currentPage === 2 ? "/blog" : `/blog?page=${currentPage - 1}`}
          className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
        >
          Précédent
        </Link>
      )}
      <span className="px-4 py-2 text-sm text-muted-foreground">
        Page {currentPage} / {totalPages}
      </span>
      {hasNext && (
        <Link
          href={`/blog?page=${currentPage + 1}`}
          className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
        >
          Suivant
        </Link>
      )}
    </div>
  )
}
