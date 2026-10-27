import { CinematicImage } from "./cinematic-art";
import { adventureScenes } from "./adventure-scenes";
import type { BuildId } from "../domain/festival";

export type IconName =
  BuildId | "supplies" | "clock" | "people" | "spark" | "play" | "proof";

export function CityIcon({
  name,
  className = "size-6",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    music: (
      <>
        <path d="M9 18V5l11-2v13M9 8l11-2" />
        <ellipse cx="6" cy="18" rx="3" ry="2" />
        <ellipse cx="17" cy="16" rx="3" ry="2" />
      </>
    ),
    food: (
      <>
        <path d="M4 11h16l-2 8H6l-2-8ZM3 22h18M8 2v5m4-5v5m4-5v5" />
      </>
    ),
    art: (
      <>
        <path d="m4 17 12-13 4 4L7 21H3l1-4ZM13 7l4 4M5 16l3 3" />
      </>
    ),
    access: (
      <>
        <circle cx="12" cy="4" r="2" />
        <path d="M12 8v6h5l3 6M12 10H8a6 6 0 1 0 6 8" />
      </>
    ),
    shelter: (
      <>
        <path d="M2 12a10 10 0 0 1 20 0H2Zm10 0v7a3 3 0 0 0 6 0M12 2V1" />
      </>
    ),
    signs: (
      <>
        <path d="m3 10 17-6v16L3 14v-4Zm3 5 2 7h4l-2-6M20 8l3-2m-3 10 3 2" />
      </>
    ),
    supplies: (
      <>
        <path d="m3 7 9-5 9 5v11l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v11M8 4l9 5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 3" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M2 21v-4a7 7 0 0 1 14 0v4M17 4a3 3 0 0 1 0 6m3 11v-4a6 6 0 0 0-3-5" />
      </>
    ),
    spark: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />,
    play: <path d="m7 3 14 9L7 21V3Z" />,
    proof: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="m8 13 3 3 6-7M8 5V2h8v3" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

export function BuildMiniature({ id }: { id: BuildId }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 90"
      className="h-16 w-24 sm:h-20 sm:w-28"
    >
      <ellipse cx="60" cy="76" rx="48" ry="10" fill="#13143a" opacity=".28" />
      {id === "music" ? (
        <>
          <path d="m12 55 47-18 48 18-47 20Z" fill="#31266c" />
          <path d="M12 55v10l48 19 47-19V55L60 74Z" fill="#5c47ae" />
          <path
            d="M22 52V16h75v36M22 18l75 33M97 18 22 51"
            fill="none"
            stroke="#ccaa66"
            strokeWidth="4"
          />
          <path d="m18 17 42-9 42 9Z" fill="#e5bc71" />
          <rect x="26" y="42" width="13" height="20" rx="2" fill="#201d45" />
          <rect x="82" y="42" width="13" height="20" rx="2" fill="#201d45" />
          <circle cx="60" cy="40" r="7" fill="#f3bf78" />
          <path d="M60 47v16m-8-10 8-6 9 5" stroke="#60dbce" strokeWidth="5" />
        </>
      ) : id === "food" ? (
        <>
          <path d="m16 40 44-16 44 16-44 18Z" fill="#d7b272" />
          <path d="M19 40v28l41 15 41-15V40L60 56Z" fill="#96664b" />
          <path d="m10 28 50-19 50 19-50 19Z" fill="#f4c885" />
          <path d="M10 28v13l50 19 50-19V28L60 47Z" fill="#dd715d" />
          <path
            d="M35 38v13m24-4v13m25-22v13"
            stroke="#ffe3ad"
            strokeWidth="10"
          />
          <path d="M27 57v16m65-16v16" stroke="#3f3152" strokeWidth="4" />
          <ellipse cx="61" cy="66" rx="17" ry="5" fill="#ffe6ab" />
        </>
      ) : id === "art" ? (
        <>
          <path d="m14 47 47-20 46 20-46 21Z" fill="#87d9cb" />
          <path
            d="M22 51v23m76-23v23M60 66v16"
            stroke="#b18362"
            strokeWidth="5"
          />
          <path d="m55 40 21-8 11 12-20 8Z" fill="#fcdfad" />
          <path d="m62 39 9 5m-5-9 8 6" stroke="#da725f" strokeWidth="3" />
          <path d="M33 40v-9m6 8V28m5 9v-8" stroke="#e4bb75" strokeWidth="3" />
          <path d="m29 40 20-7-2 15-16 5Z" fill="#6451a8" />
        </>
      ) : id === "access" ? (
        <>
          <path d="m9 63 48-24 53 24-53 24Z" fill="#ede0bb" />
          <path
            d="m14 66 44-22 46 22"
            fill="none"
            stroke="#64cfbe"
            strokeWidth="4"
            strokeDasharray="8 4"
          />
          <circle
            cx="55"
            cy="54"
            r="12"
            stroke="#403567"
            strokeWidth="4"
            fill="none"
          />
          <circle cx="59" cy="28" r="6" fill="#e8b47d" />
          <path
            d="M59 37v17h13l10 13M59 41H48"
            fill="none"
            stroke="#775de0"
            strokeWidth="6"
          />
        </>
      ) : id === "shelter" ? (
        <>
          <path
            d="M22 40v34m76-34v34M60 60v22"
            stroke="#dfbd87"
            strokeWidth="4"
          />
          <path d="m9 39 51-29 51 29-51 23Z" fill="#5369ba" />
          <path d="m9 39 51-29v52Z" fill="#8195de" />
          <path d="M9 39v8l51 23 51-23v-8L60 62Z" fill="#384e93" />
          <path d="m60 10 21 42" stroke="#a7b4e8" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d="M59 28v53" stroke="#e3bf89" strokeWidth="6" />
          <path d="m28 27 45-15 18 13-17 14-46 11Z" fill="#71d3bf" />
          <path d="m36 51 42-14 16 11-17 14-41 10Z" fill="#f0c37c" />
          <path d="m50 28 20-6m-20 37 19-6" stroke="#344269" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}

export function CityBackdrop({
  children,
  rainy = false,
  celebrating = false,
  interactive = false,
}: {
  children?: React.ReactNode;
  rainy?: boolean;
  celebrating?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={`city-scene relative isolate overflow-hidden rounded-3xl bg-[#292749] ${rainy ? "city-rain" : ""} ${celebrating ? "city-celebrate" : ""} ${interactive ? "city-scene-play" : ""}`}
    >
      <CinematicImage src={adventureScenes.city} priority />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#181633]/20 via-transparent to-[#181633]/50" />
      {children}
    </div>
  );
}
