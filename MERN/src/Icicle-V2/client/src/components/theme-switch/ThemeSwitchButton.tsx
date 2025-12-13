"use client";

import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { Button } from "@heroui/react";
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

type ThemeSwitchButtonProps = Omit<ButtonProps, "isIconOnly" | "onPress" | "children" | "aria-label" | "isLoading">;

export default function ThemeSwitchButton(restProps: ThemeSwitchButtonProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isSSR = useIsSSR();

  if (isSSR) return null;

  const currentTheme: ThemeMode = theme === "system" ? "system" : (resolvedTheme as ThemeMode) ?? "light";

  const Icon = ICONS[currentTheme];

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const nextThemeLabel = currentTheme === "dark" ? LABELS.light : LABELS.dark;
  const ariaLabel = `Chuyển sang chế độ ${nextThemeLabel}`;

  const defaultClassName = "border-1";
  const combinedClassName = `${defaultClassName} ${restProps.className || ''}`;

  return (
    <div className="transition-colors">
      <Button
        isIconOnly
        radius="full"
        size="md"
        {...restProps}
        variant={restProps.variant || "light"}
        className={combinedClassName}
        aria-label={ariaLabel}
        onPress={toggleTheme}
      >
        <Icon />
      </Button>
    </div>
  );
}