"use client"

import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilterFloatingButtonProps {
  onClick: () => void
  activeFilterCount?: number
  className?: string
}

export function FilterFloatingButton({
  onClick,
  activeFilterCount = 0,
  className,
}: FilterFloatingButtonProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden",
        className
      )}
    >
      <Button
        size="lg"
        onClick={onClick}
        className="shadow-lg gap-2 px-6"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtres
        {activeFilterCount > 0 && (
          <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground/20 px-1.5 text-xs font-medium">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  )
}
