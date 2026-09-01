import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "pp-button-primary",
  secondary: "pp-button-secondary",
  ghost: "pp-button-ghost",
  premium: "pp-button-premium",
} as const;

type ButtonVariant = keyof typeof variants;

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
      style={style}
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
      style={style}
      {...props}
    />
  );
}
