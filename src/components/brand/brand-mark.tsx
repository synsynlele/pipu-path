import Image from "next/image";
import Link from "next/link";

import { PIPUPATH_LOGO_DATA_URI } from "@/components/brand/brand-assets";

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
        className="relative grid size-10 shrink-0 place-items-center"
      >
        <Image
          src={PIPUPATH_LOGO_DATA_URI}
          alt=""
          width={96}
          height={96}
          unoptimized
          priority
          className="size-10 object-contain"
        />
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
