// client/src/components/generals/SearchInput.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Input, InputProps } from "@heroui/react";
import { Magnifer } from '@solar-icons/react'
import { useDebounce } from "@/hooks/generals/useDebounce";

// ============================================================================
// TYPES
// ============================================================================

export interface SearchInputProps extends Omit<InputProps, "value" | "onValueChange" | "onChange" | "onClear"> {
  /**
   * Callback fired when the debounce delay has passed.
   * Use this to trigger API calls.
   */
  onSearch: (value: string) => void;

  /**
   * Callback fired immediately when user types or clears.
   * Use this to toggle loading states.
   */
  onSearching?: (isSearching: boolean) => void;

  /**
   * Initial default value (default: "")
   */
  defaultValue?: string;

  /**
   * Debounce delay in ms (default: 500)
   */
  debounceTime?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      onSearch,
      onSearching,
      defaultValue = "",
      debounceTime = 500,
      className,
      classNames,
      placeholder = "Tìm kiếm...",
      startContent,
      ...props
    },
    ref
  ) => {
    // 1. Internal state for controlled input
    const [innerValue, setInnerValue] = useState<string>(defaultValue);
    
    // 2. Debounce the value
    const debouncedValue = useDebounce<string>(innerValue, debounceTime);

    // Ref to prevent initial search trigger on mount if needed
    const isMounted = useRef(false);

    // ------------------------------------------------------------------------
    // EFFECTS
    // ------------------------------------------------------------------------

    useEffect(() => {
      if (!isMounted.current) {
        isMounted.current = true;
        if (defaultValue) onSearch(defaultValue);
        return;
      }

      // Trigger search when debounced value changes
      onSearch(debouncedValue);
      
      // Stop searching/loading state
      if (onSearching) onSearching(false);
      
    }, [debouncedValue]); // eslint-disable-line react-hooks/exhaustive-deps

    // ------------------------------------------------------------------------
    // HANDLERS
    // ------------------------------------------------------------------------

    const handleValueChange = useCallback(
      (value: string) => {
        setInnerValue(value);
        if (onSearching) onSearching(true);
      },
      [onSearching]
    );

    const handleClear = useCallback(() => {
      // HeroUI's onClear event
      setInnerValue("");
      if (onSearching) onSearching(true);
    }, [onSearching]);

    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------

    return (
      <Input
        ref={ref}
        // Controlled State
        value={innerValue}
        onValueChange={handleValueChange}
        
        // HeroUI Native Clearable
        isClearable
        onClear={handleClear}
        
        // Styles & Props
        placeholder={placeholder}
        variant="bordered"
        className={`w-full ${className || ""}`}
        classNames={{
            inputWrapper: "bg-default-50 dark:bg-default-100 border-small border-divider",
            ...classNames,
        }}
        startContent={
          startContent || (
            <Magnifer/>
          )
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
