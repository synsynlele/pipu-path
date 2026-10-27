import { GameDirectoryLink } from "./game-directory-link";
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
        <p className="mb-1 text-[0.65rem] text-[#b6cede] sm:hidden">Swipe sideways to choose a world</p>
        <div className="flex min-w-0 snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          <GameDirectoryLink href="/build/neighbourhood">
            ⌂ Neighbourhood · move & build
          </GameDirectoryLink>
          <GameDirectoryLink href="/build/play">Unbuilt City</GameDirectoryLink>
          {worldDirectory.map(({ id }) => (
            <GameDirectoryLink key={id} href={`/build/play/${id}`}>
              {getGameChapter(id)?.title}
            </GameDirectoryLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
