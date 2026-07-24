import Link from "next/link";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 rounded-lg"
      aria-label="PipuPath home"
    >
      <span
        aria-hidden="true"
        className="border-gold/50 bg-gold/10 text-gold grid size-9 place-items-center rounded-full border text-sm font-bold"
      >
        P
      </span>
      {!compact && (
        <span className="text-sm font-semibold tracking-[0.16em] uppercase">
          PipuPath
        </span>
      )}
    </Link>
  );
}
