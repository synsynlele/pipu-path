import type { ComponentProps } from "react";

export function Surface({
  className = "",
  style,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={`border-border bg-panel rounded-3xl border shadow-[0_18px_60px_-34px_rgba(29,78,216,0.38)] ${className}`}
      style={{
        backgroundColor: "#07142f",
        borderColor: "#1a2d55",
        color: "#f8fafc",
        ...style,
      }}
      {...props}
    />
  );
}
