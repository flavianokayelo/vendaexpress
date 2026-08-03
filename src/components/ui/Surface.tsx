import { type ReactNode } from "react";

export function Surface({
  children,
  className = "",
  as: Comp = "div",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "button";
  onClick?: () => void;
}) {
  return (
    <Comp
      onClick={onClick}
      className={`rounded-[2px] border border-border bg-paper shadow-card transition-all duration-200 ${className}`}
    >
      {children}
    </Comp>
  );
}