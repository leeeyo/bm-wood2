"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

export interface SearchInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Current search value */
  value?: string;
  /** Callback when search value changes (debounced) */
  onSearch?: (value: string) => void;
  /** Callback when value changes immediately */
  onChange?: (value: string) => void;
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number;
  /** Show keyboard shortcut hint */
  showShortcutHint?: boolean;
  /** Enable Ctrl+K / Cmd+K keyboard shortcut to focus */
  enableShortcut?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Show loading indicator */
  isLoading?: boolean;
}

export function SearchInput({
  placeholder = "Rechercher...",
  value: controlledValue,
  onSearch,
  onChange,
  debounceMs = 300,
  showShortcutHint = true,
  enableShortcut = true,
  className,
  disabled = false,
  isLoading = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use controlled value if provided
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  // Debounce the search value
  const debouncedValue = useDebounce(value, debounceMs);

  // Call onSearch when debounced value changes
  useEffect(() => {
    onSearch?.(debouncedValue);
  }, [debouncedValue, onSearch]);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [controlledValue, onChange]
  );

  // Handle clear button
  const handleClear = useCallback(() => {
    if (controlledValue === undefined) {
      setInternalValue("");
    }
    onChange?.("");
    onSearch?.("");
    inputRef.current?.focus();
  }, [controlledValue, onChange, onSearch]);

  // Handle keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    if (!enableShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut]);

  // Handle Escape key to blur input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      inputRef.current?.blur();
      if (value) {
        handleClear();
      }
    }
  }, [value, handleClear]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="relative flex-1">
        {/* Search icon */}
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground",
            isLoading && "animate-pulse"
          )}
        />
        
        {/* Input */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "pl-9",
            showShortcutHint && !value ? "pr-16" : value ? "pr-9" : "pr-3"
          )}
        />
        
        {/* Keyboard shortcut hint */}
        {showShortcutHint && !value && enableShortcut && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
            <Kbd className="text-xs">
              <Command className="size-3" />
            </Kbd>
            <Kbd className="text-xs">K</Kbd>
          </div>
        )}
        
        {/* Clear button */}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
            onClick={handleClear}
            disabled={disabled}
          >
            <X className="size-4" />
            <span className="sr-only">Effacer</span>
          </Button>
        )}
      </div>
    </div>
  );
}
