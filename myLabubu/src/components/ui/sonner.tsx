"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";
import React from "react";

// Remove next-themes dependency (Next.js only)
const Toaster = ({ ...props }: ToasterProps) => {
  const theme = "light"; // or "dark" / "system" depending on your setup

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

