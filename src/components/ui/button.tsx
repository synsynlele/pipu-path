import Link from "next/link";
import type { ComponentProps, CSSProperties } from "react";

const variants = {
  primary: "pp-button-primary",
  secondary: "pp-button-secondary",
  ghost: "pp-button-ghost",
  premium: "pp-button-premium",
} as const;

type ButtonVariant = keyof typeof variants;

const fallbackStyles = {
  primary: {
    backgroundColor: "#4f7cff",
    borderColor: "#4f7cff",
    color: "#ffffff",
  },
  secondary: {
    backgroundColor: "#0c1c3c",
    borderColor: "#1a2d55",
    color: "#f8fafc",
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    color: "#dbeafe",
  },
  premium: {
    backgroundColor: "#c9a54d",
    borderColor: "#c9a54d",
    color: "#061027",
  },
} satisfies Record<ButtonVariant, CSSProperties>;

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
};

export function ButtonLink({
  className = "",
  variant = "primary",
  style,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 hover:-translate-y-0.5 ${variants[variant]} ${className}`}
      style={{ ...fallbackStyles[variant], ...style }}
      {...props}
    />
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
      style={{ ...fallbackStyles[variant], ...style }}
      {...props}
    />
  );
}
