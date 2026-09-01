import { BrandMark } from "@/components/brand/brand-mark";
import { Surface } from "@/components/ui/surface";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="relative min-h-screen px-5 py-8 sm:px-8 lg:grid lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch lg:p-0"
    >
      <div className="absolute top-6 left-5 z-20 sm:left-8 lg:top-10 lg:left-10">
        <BrandMark />
      </div>

      <section className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#eef0ff_0%,#f9faff_52%,#fff8e8_100%)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -top-28 -right-24 size-96 rounded-full border border-[#dfe1f6]" />
        <div className="absolute right-10 bottom-20 size-60 rounded-full bg-[#dfe2ff]/70 blur-3xl" />
        <div className="relative mt-20">
          <div className="mt-24 max-w-xl">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#6f79f7] uppercase">
              Discover. Develop. Deploy.
            </p>
            <h2 className="mt-5 text-5xl leading-tight font-bold tracking-tight text-[#18233d]">
              Discover who you are. Build what you carry.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
              PipuPath turns reflection into a practical Mission, real-world
              Quests and credible proof.
            </p>
          </div>
        </div>
        <div className="relative flex gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-full bg-white/80 px-3 py-2">Private by default</span>
          <span className="rounded-full bg-white/80 px-3 py-2">Progress through action</span>
        </div>
      </section>

      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center pt-20 lg:min-h-screen lg:pt-0">
        <div className="w-full max-w-lg">
          <Surface className="p-6 sm:p-9">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#6f79f7] uppercase">
              Secure access
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#18233d] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 leading-7 text-slate-500">{description}</p>
            <div className="mt-7">{children}</div>
          </Surface>
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Your developmental data remains private unless you deliberately
            publish selected Project proof.
          </p>
        </div>
      </section>
    </main>
  );
}
