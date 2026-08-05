import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary:
    "border border-primary bg-primary text-white shadow-sm shadow-primary/20 hover:border-primary-light hover:bg-primary-light",
  secondary:
    "border border-border bg-panel-raised text-foreground shadow-sm hover:border-primary/35 hover:bg-primary-soft/50",
  ghost:
    "border border-transparent bg-transparent text-muted hover:bg-primary-soft/60 hover:text-primary-light",
  premium:
    "border border-gold bg-gold text-[#061027] shadow-sm shadow-gold/20 hover:bg-gold-light",
} as const;

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
};

export function ButtonLink({
  className = "",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 hover:-translate-y-0.5 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
