import type { ComponentProps } from "react";

export function Surface({
  className = "",
  style,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={`border-border bg-panel rounded-[1.75rem] border shadow-[0_20px_48px_-34px_rgba(36,48,78,0.42)] ${className}`}
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e4e8f1",
        color: "#18233d",
        ...style,
      }}
      {...props}
    />
  );
}
