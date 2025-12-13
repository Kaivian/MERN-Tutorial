"use client";

import { useTheme } from "next-themes";
import clsx from "clsx";

export const useSyncImage = (src: string, alt: string = "logo") => {
  const { resolvedTheme } = useTheme();

  return {
    src,
    alt,
    classNames: {
      wrapper: "transition-all duration-300 w-auto",
      img: clsx(resolvedTheme === "dark" && "brightness-0 invert"),
    },
  };
};