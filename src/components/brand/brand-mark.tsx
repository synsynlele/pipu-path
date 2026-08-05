import Link from "next/link";

type BrandMarkProps = {
  compact?: boolean;
  href?: string;
  inverse?: boolean;
  className?: string;
};

export function BrandMark({
  compact = false,
  href = "/",
  inverse = false,
  className = "",
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 rounded-xl ${className}`}
      aria-label="PipuPath home"
    >
      <span
        aria-hidden="true"
        className="from-primary to-primary-light shadow-primary/20 relative grid size-10 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-lg"
      >
        P
        <span className="bg-gold absolute right-1.5 bottom-1.5 size-2 rounded-full" />
      </span>
      {!compact && (
        <span
          className={`${inverse ? "text-white" : "text-navy"} text-sm font-bold tracking-[0.13em] uppercase`}
        >
          PipuPath
        </span>
      )}
    </Link>
  );
}
