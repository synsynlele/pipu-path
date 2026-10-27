import Image from "next/image";

export function CinematicImage({
  src,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 960px",
}: {
  src: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      unoptimized
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}

export type GardenSymbolName = "seed" | "path" | "water" | "invite" | "bench" | "sun";
export function GardenSymbol({ name, className = "size-7" }: { name: GardenSymbolName; className?: string }) {
  const paths: Record<GardenSymbolName, React.ReactNode> = {
    seed: <><path d="M12 22V12m0 4c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-4c0-6 3-9 9-9 0 6-3 9-9 9Z" /><path d="M4 22h16" /></>,
    path: <><path d="m8 2 2 7-4 5-2 8m12-20-2 7 4 5 2 8M10 9h4M6 14h12M4 22h16" /></>,
    water: <><path d="M12 2c-4 6-7 10-7 14a7 7 0 0 0 14 0c0-4-3-8-7-14Z" /><path d="M8 16a4 4 0 0 0 4 4" /></>,
    invite: <><path d="M3 10v4l12 5V5L3 10Zm12-3 5-3v16l-5-3M6 15l2 7h4l-2-6M21 9l2-1m-2 7 2 1" /></>,
    bench: <><path d="M4 11h16v5H4zM6 6v5m12-5v5M6 16v6m12-6v6M3 22h18" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}
