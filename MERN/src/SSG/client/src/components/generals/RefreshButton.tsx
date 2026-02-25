// client/src/components/generals/RefreshButton.tsx
"use client";

import React, { useState } from "react";
import { Button, ButtonProps, Tooltip, cn } from "@heroui/react";
import { RotateCw } from 'lucide-react';
import { PressEvent } from "@react-types/shared";
import { useSpin } from "@/hooks/generals/useSpin";

// ============================================================================
// TYPES
// ============================================================================

export interface RefreshButtonProps extends ButtonProps {
  /**
   * Function to execute on click.
   * If this function returns a Promise, the button will spin until the promise resolves,
   * then settle smoothly to 0 degrees.
   */
  onRefresh?: () => Promise<void> | void;

  /**
   * Text to display inside the tooltip.
   * Default: "Tải lại dữ liệu"
   */
  tooltip?: string;

  /**
   * Custom icon to display.
   * Defaults to <Restart /> from @solar-icons/react
   */
  icon?: React.ReactNode;

  /**
   * ClassName for the icon specifically.
   */
  iconClassName?: string;

  /**
   * Speed of rotation multiplier (1 = 360deg/s).
   * Default: 2
   */
  spinSpeed?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

const RefreshButton = React.forwardRef<HTMLButtonElement, RefreshButtonProps>(
  (
    {
      onRefresh,
      tooltip = "Tải lại dữ liệu",
      icon,
      className,
      iconClassName,
      children,
      variant = "bordered",
      isIconOnly = true,
      spinSpeed = 2,
      onPress,
      isDisabled,
      ...props
    },
    ref
  ) => {
    // 1. Setup Spin Hook
    const { rotation, settling, start, settle } = useSpin(spinSpeed);

    // 2. Local state to track API execution status
    const [isExecuting, setIsExecuting] = useState(false);

    // Button is busy if: API is running OR Icon is settling (slowing down)
    const isBusy = isExecuting || settling;

    // ------------------------------------------------------------------------
    // HANDLERS
    // ------------------------------------------------------------------------

    const handlePress = (e: PressEvent) => {
      if (isBusy) return; // Prevent double clicks

      // 1. Trigger original onPress
      if (onPress) onPress(e);

      // 2. Stop if no refresh handler
      if (!onRefresh) return;

      // 3. Start Visuals & Logic
      setIsExecuting(true);
      start(); // Start spinning

      const result = onRefresh();

      // 4. Handle Async or Sync result
      if (result instanceof Promise) {
        result.finally(() => {
          setIsExecuting(false);
          settle(); // Trigger smooth stop
        });
      } else {
        // If sync, stop immediately (but smoothly)
        setIsExecuting(false);
        settle();
      }
    };

    // ------------------------------------------------------------------------
    // RENDER HELPER
    // ------------------------------------------------------------------------

    const renderButton = () => (
      <Button
        ref={ref}
        variant={variant}
        isIconOnly={isIconOnly}
        aria-label={(props as React.ButtonHTMLAttributes<HTMLButtonElement>)['aria-label'] || tooltip}
        className={cn(
          // Base styles matching SearchInput
          "bg-default-50 dark:bg-default-100 border-small border-divider",
          "text-default-500 hover:text-default-700 data-[hover=true]:bg-default-200",
          className
        )}
        onPress={handlePress}
        // Disable when busy (spinning/loading) or explicitly disabled
        isDisabled={isBusy || isDisabled}
        {...props}
      >
        <div
          className={cn(
            "flex items-center justify-center",
            iconClassName
          )}
          style={{
            transform: `rotate(${rotation}deg)`,
            willChange: "transform", // Performance optimization
          }}
        >
          {icon || <RotateCw size={20} />}
        </div>

        {!isIconOnly && children}
      </Button>
    );

    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------

    if (tooltip) {
      return (
        <Tooltip content={tooltip} closeDelay={200}>
          {renderButton()}
        </Tooltip>
      );
    }

    return renderButton();
  }
);

RefreshButton.displayName = "RefreshButton";

export default RefreshButton;