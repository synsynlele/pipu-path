import Link from "next/link";
import { worldDirectory } from "./world-presentation";
import { getGameChapter } from "../domain/chapters";

export function GameDirectory() {
  return (
    <nav
      aria-label="All games"
      className="adventure-dark border-b border-white/20 bg-[#091d2d] px-3 py-3 text-white"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/build/adventures"
          className="inline-flex min-h-11 items-center gap-2 text-base font-bold text-[#f1ce8e]"
        >
          ◈ All games{" "}
          <span className="text-xs font-normal text-white">
            6 worlds + your neighbourhood
          </span>
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/build/neighbourhood"
            className="inline-flex min-h-11 items-center rounded-xl border border-[#f1ce8e] bg-[#29434d] px-3 text-xs font-bold text-white"
          >
            ⌂ Neighbourhood · move & build
          </Link>
          <Link
            href="/build/play"
            className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-3 text-xs text-white"
          >
            Unbuilt City
          </Link>
          {worldDirectory.map(({ id }) => (
            <Link
              key={id}
              href={`/build/play/${id}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-3 text-xs text-white"
            >
              {getGameChapter(id)?.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
