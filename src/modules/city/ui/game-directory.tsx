import { GameDirectoryLink } from "./game-directory-link";
import Link from "next/link";

/** Three stable navigation destinations; worlds live on the learning path. */
export function GameDirectory() {
  return (
    <nav
      aria-label="PipuPath game navigation"
      className="adventure-dark border-b border-white/15 bg-[#0b2231] px-3 py-2 text-white"
    >
      <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-wrap items-center justify-between gap-2">
        <Link
          href="/build/adventures"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-extrabold tracking-wide text-[#f3d58f] sm:text-sm"
        >
          <span aria-hidden="true" className="text-lg">◈</span>
          PipuPath Adventure
        </Link>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5" role="group" aria-label="Adventure sections">
          <GameDirectoryLink href="/build/adventures">Path</GameDirectoryLink>
          <GameDirectoryLink href="/build/neighbourhood">Explore</GameDirectoryLink>
          <GameDirectoryLink href="/quests">Real Quest</GameDirectoryLink>
        </div>
      </div>
    </nav>
  );
}
