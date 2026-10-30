"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveRealBuild } from "../application/actions";
import type { BuildDraft, SavedBuild } from "../domain/build";
export function BuildAttemptForm({
  build,
  retired = false,
}: {
  build: SavedBuild;
  retired?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<BuildDraft>(build.draft),
    [baseline, setBaseline] = useState(JSON.stringify(build.draft)),
    [version, setVersion] = useState(build.version),
    [message, setMessage] = useState(""),
    [ok, setOk] = useState(false),
    [pending, startTransition] = useTransition(),
    [photoChanged, setPhotoChanged] = useState(false);
  const photo = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(draft) !== baseline || photoChanged;
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const change = (key: keyof BuildDraft, value: string) =>
    setDraft((v) => ({ ...v, [key]: value }));
  return (
    <form
      method="post"
      className="mt-6 space-y-5"
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const submitter = (e.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null;
        form.set("intent", submitter?.value ?? "save");
        setMessage("");
        startTransition(async () => {
          try {
            const result = await saveRealBuild(
              { ok: false, message: "" },
              form,
            );
            setMessage(result.message);
            setOk(result.ok);
            if (result.ok) {
              setBaseline(JSON.stringify(draft));
              setVersion(result.version ?? version);
              setPhotoChanged(false);
              if (photo.current) photo.current.value = "";
              router.refresh();
            }
          } catch {
            setOk(false);
            setMessage(
              "The connection was interrupted. Keep this page open; your edits are still here. Try saving again.",
            );
          }
        });
      }}
    >
      <input type="hidden" name="id" value={build.id} />
      <input type="hidden" name="version" value={version} />
      <section
        className="build-card space-y-4"
        aria-labelledby="evidence-heading"
      >
        <h2 id="evidence-heading" className="text-lg font-extrabold">
          2. Show what happened
        </h2>
        <p className="text-sm leading-6 text-[#52647c]">
          {build.challenge.evidence} An honest attempt that did not work is
          welcome.
        </p>
        <label>
          What did you actually do?
          <textarea
            name="evidence"
            rows={4}
            maxLength={3000}
            value={draft.evidence}
            onChange={(e) => change("evidence", e.target.value)}
            className="mt-2"
            placeholder="Describe your action and what you observed. Don’t invent a result."
          />
        </label>
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-[#1d4ed8]">
            Add a link or photo · optional
          </summary>
          <div className="mt-4 space-y-4">
            <label>
              Link to your work
              <input
                type="url"
                name="link"
                value={draft.link}
                maxLength={1200}
                onChange={(e) => change("link", e.target.value)}
                placeholder="https://…"
                className="mt-2"
              />
            </label>
            <label>
              Photo of your work
              <input
                ref={photo}
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                onChange={() =>
                  setPhotoChanged(Boolean(photo.current?.files?.length))
                }
                className="mt-2"
              />
            </label>
            <p className="text-xs leading-5 text-[#52647c]">
              JPG, PNG or WebP, up to 3 MB. Photograph the work; avoid faces,
              addresses and private information. A written account is enough.
            </p>
            {build.image_path ? (
              <p className="text-xs text-[#52647c]">
                A private photo is already saved. A new upload replaces the
                displayed photo.
              </p>
            ) : null}
          </div>
        </details>
      </section>
      <section
        className="build-card space-y-4"
        aria-labelledby="reflection-heading"
      >
        <h2 id="reflection-heading" className="text-lg font-extrabold">
          3. Learn and continue
        </h2>
        <label>
          How did it go?
          <select
            name="outcome"
            value={draft.outcome}
            onChange={(e) => change("outcome", e.target.value)}
            className="mt-2"
          >
            <option value="">Choose what really happened</option>
            <option value="worked">It worked</option>
            <option value="partly">Part of it worked</option>
            <option value="not_yet">It did not work yet</option>
          </select>
        </label>
        <label>
          What did you learn?
          <textarea
            name="reflection"
            rows={3}
            maxLength={2000}
            value={draft.reflection}
            onChange={(e) => change("reflection", e.target.value)}
            className="mt-2"
          />
        </label>
        <label>
          What will you change or try next?
          <textarea
            name="nextChange"
            rows={3}
            maxLength={1000}
            value={draft.nextChange}
            onChange={(e) => change("nextChange", e.target.value)}
            className="mt-2"
          />
        </label>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          name="intent"
          value="save"
          disabled={pending}
          className="pp-button-ghost flex w-full items-center justify-center gap-2 border-2 border-[#b9cce5] bg-white text-[#16488f] shadow-sm sm:w-auto"
        >
          Save for later
        </button>
        <button
          type="submit"
          name="intent"
          value="record"
          disabled={pending}
          className="build-primary w-full sm:flex-1"
        >
          Record my attempt →
        </button>
      </div>
      {pending ? (
        <p role="status" className="text-sm">
          Saving your work…
        </p>
      ) : message ? (
        <p
          role={ok ? "status" : "alert"}
          className={ok ? "text-sm text-[#176245]" : "text-sm text-[#b42338]"}
        >
          {message}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-[#52647c]">
        Recording an attempt saves your account of the work. It does not verify
        success, award XP or publish your evidence.
      </p>
      <details id="quest-set-aside" open={retired}>
        <summary className="cursor-pointer text-sm text-[#52647c]">
          This Quest is not right for me
        </summary>
        <p className="mt-3 text-sm leading-6">
          Save this attempt in your history and choose another topic. This does
          not mark it completed.
        </p>
        <button
          type="submit"
          name="intent"
          value="archive"
          disabled={pending}
          className="pp-button-ghost mt-3 w-full border-2 border-[#b9cce5] bg-white text-[#16488f] shadow-sm sm:w-auto"
        >
          Set aside and choose another
        </button>
      </details>
    </form>
  );
}
