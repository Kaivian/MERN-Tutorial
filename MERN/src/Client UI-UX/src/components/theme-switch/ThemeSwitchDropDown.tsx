"use client";

import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Sun, Moon, Monitor } from "lucide-react";

type ButtonProps = React.ComponentProps<typeof Button>;

type ThemeMode = "light" | "dark" | "system";

const LABELS: Record<ThemeMode, string> = {
  light: "Sáng",
  dark: "Tối",
  system: "Hệ thống",
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

  if (isSSR) return null;

  const currentDisplay: ThemeMode = theme === "system" ? "system" : (resolvedTheme as ThemeMode) ?? "light";

  const currentSelection: ThemeMode = (theme as ThemeMode) ?? "light";

  const Icon = ICONS[currentDisplay];

  const defaultClassName = "w-26 border-1";
  const combinedClassName = `${defaultClassName} ${restProps.className || ''}`;

  return (
    <div className="transition-colors">
      <Dropdown>
        <DropdownTrigger>
          <Button
            size="sm"
            {...restProps}

            variant={restProps.variant || "light"}
            className={combinedClassName}
            aria-label="Chọn giao diện"
            endContent={<Icon className="h-4 w-4" />}
          >
            {LABELS[currentDisplay]}
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Chọn chế độ giao diện"
          selectionMode="single"
          selectedKeys={new Set([currentSelection])}
          onAction={(key) => setTheme(String(key))}
          className="min-w-[120px]"
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