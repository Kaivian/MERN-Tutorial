// src/hooks/generals/useSyncImage.ts
import { useTheme } from "next-themes";
import clsx from "clsx";

/**
 * Custom hook to synchronize image styles with the current theme
 * Automatically adjusts image appearance in dark mode
 *
 * @param src Image source URL
 * @param alt Alternative text for the image (default: "logo")
 * @returns Image props including src, alt, and theme-aware class names
 */
export const useSyncImage = (src: string, alt: string = "logo") => {
  const { resolvedTheme } = useTheme();

  return {
    src,
    alt,
    classNames: {
      // Wrapper styling with smooth transition
      wrapper: "transition-all duration-300 w-auto",

      // Invert image colors in dark mode for better visibility
      img: clsx(resolvedTheme === "dark" && "brightness-0 invert"),
    },
  };
};
