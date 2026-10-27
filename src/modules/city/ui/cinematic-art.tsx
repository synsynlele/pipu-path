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

export type GardenSymbolName =
  | "seed"
  | "path"
  | "water"
  | "invite"
  | "bench"
  | "sun"
  | "book"
  | "recycle"
  | "box"
  | "shield"
  | "tool"
  | "people"
  | "wifi"
  | "heart"
  | "food"
  | "truck"
  | "map";
export function GardenSymbol({
  name,
  className = "size-7",
}: {
  name: GardenSymbolName;
  className?: string;
}) {
  const paths: Record<GardenSymbolName, React.ReactNode> = {
    seed: (
      <>
        <path d="M12 22V12m0 4c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-4c0-6 3-9 9-9 0 6-3 9-9 9Z" />
        <path d="M4 22h16" />
      </>
    ),
    path: (
      <>
        <path d="m8 2 2 7-4 5-2 8m12-20-2 7 4 5 2 8M10 9h4M6 14h12M4 22h16" />
      </>
    ),
    water: (
      <>
        <path d="M12 2c-4 6-7 10-7 14a7 7 0 0 0 14 0c0-4-3-8-7-14Z" />
        <path d="M8 16a4 4 0 0 0 4 4" />
      </>
    ),
    invite: (
      <>
        <path d="M3 10v4l12 5V5L3 10Zm12-3 5-3v16l-5-3M6 15l2 7h4l-2-6M21 9l2-1m-2 7 2 1" />
      </>
    ),
    bench: (
      <>
        <path d="M4 11h16v5H4zM6 6v5m12-5v5M6 16v6m12-6v6M3 22h18" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" />
      </>
    ),
    book: (
      <>
        <path d="M12 6c-3-2-7-2-10-1v14c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1Zm0 0v14" />
      </>
    ),
    recycle: (
      <>
        <path d="m8 3 2 3-2 3m2-3h7l-2-3m6 7-4 1-1-4m1 4 3 5-3 5m-5 0-3-3 3-3m-3 3H4l-2-4" />
      </>
    ),
    box: (
      <>
        <path d="m3 7 9-4 9 4v11l-9 4-9-4V7Zm0 0 9 5 9-5M12 12v10" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 9 4v6c0 5-3 9-9 10-6-1-9-5-9-10V6l9-4Zm-4 10 3 3 5-6" />
      </>
    ),
    tool: (
      <>
        <path d="M21 7a5 5 0 0 1-6 6L8 20a3 3 0 0 1-4-4l7-7a5 5 0 0 1 6-6l-3 4 3 3 4-3Z" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3H3Zm14-15a3 3 0 0 1 0 6m3 9v-3a5 5 0 0 0-3-5" />
      </>
    ),
    wifi: (
      <>
        <path d="M2 9a16 16 0 0 1 20 0M5 13a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0" />
        <circle cx="12" cy="21" r="1" />
      </>
    ),
    heart: (
      <>
        <path d="M20.5 4.5a5.5 5.5 0 0 0-8 0L12 5l-.5-.5a5.5 5.5 0 0 0-8 8L12 21l8.5-8.5a5.5 5.5 0 0 0 0-8Z" />
      </>
    ),
    food: (
      <>
        <path d="M3 12h18l-2 8H5l-2-8Zm2-3h14M8 3v4m4-4v4m4-4v4" />
      </>
    ),
    truck: (
      <>
        <path d="M2 5h12v12H2V5Zm12 4h4l4 5v3h-8V9ZM2 17h3m6 0h6" />
        <circle cx="8" cy="18" r="2" />
        <circle cx="19" cy="18" r="2" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
