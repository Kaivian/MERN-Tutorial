"use client";

import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Sun, Moon, Monitor } from "lucide-react";

type ButtonProps = React.ComponentProps<typeof Button>;

type ThemeMode = "light" | "dark" | "system";

const LABELS: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const ICONS: Record<ThemeMode, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

type ThemeSwitchDropdownProps = Omit<ButtonProps, "onPress" | "children" | "aria-label" | "isLoading" | "endContent">;

export default function ThemeSwitchDropdown(restProps: ThemeSwitchDropdownProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isSSR = useIsSSR();

  // Extract isIconOnly, className, and variant to handle logic specifically
  const { isIconOnly, className, variant, ...otherProps } = restProps;

  if (isSSR) return null;

  const currentDisplay: ThemeMode = theme === "system" ? "system" : (resolvedTheme as ThemeMode) ?? "light";
  const currentSelection: ThemeMode = (theme as ThemeMode) ?? "light";

  const Icon = ICONS[currentDisplay];

  // Adjust width: remove fixed width 'w-26' if it is icon-only mode
  const widthClass = isIconOnly ? "" : "w-26";
  const defaultClassName = `${widthClass} border-1`;
  const combinedClassName = `${defaultClassName} ${className || ''}`;

  return (
    <div className="transition-colors">
      <Dropdown>
        <DropdownTrigger>
          <Button
            size="sm"
            {...otherProps}
            isIconOnly={isIconOnly}
            variant={variant || "light"}
            className={combinedClassName}
            aria-label="Chọn giao diện"
            // If icon only, endContent should be undefined to center the main icon
            endContent={!isIconOnly ? <Icon className="h-4 w-4" /> : undefined}
          >
            {isIconOnly ? (
              // Show Icon as main child if icon-only
              <Icon className="h-4 w-4" />
            ) : (
              // Show Text if standard button
              LABELS[currentDisplay]
            )}
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Chọn chế độ giao diện"
          selectionMode="single"
          selectedKeys={new Set([currentSelection])}
          onAction={(key) => setTheme(String(key))}
          className="min-w-30"
        >
          <DropdownItem key="light" startContent={<Sun className="h-4 w-4" />}>
            {LABELS.light}
          </DropdownItem>
          <DropdownItem key="dark" startContent={<Moon className="h-4 w-4" />}>
            {LABELS.dark}
          </DropdownItem>
          <DropdownItem key="system" startContent={<Monitor className="h-4 w-4" />}>
            {LABELS.system}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}