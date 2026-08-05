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
      className="relative min-h-screen px-5 py-8 sm:px-8 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:p-0"
    >
      <div className="absolute top-6 left-5 z-20 sm:left-8 lg:top-10 lg:left-12">
        <BrandMark
          inverse
          className="[&>span:last-child]:text-navy lg:[&>span:last-child]:text-white"
        />
      </div>

      <section className="from-primary to-primary-light relative hidden overflow-hidden bg-gradient-to-br p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -top-28 -right-24 size-96 rounded-full border border-white/15" />
        <div className="absolute right-12 bottom-24 size-56 rounded-full bg-white/8 blur-2xl" />
        <div className="relative max-w-xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-blue-100 uppercase">
            The University for Human Potential
          </p>
          <h2 className="mt-5 text-5xl leading-tight font-semibold tracking-tight">
            Discover who you are. Build what you carry.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50">
            PipuPath turns reflection into a practical Mission, real-world
            Quests and credible proof.
          </p>
        </div>
        <p className="text-sm text-blue-100">
          Private by default. Progress through action.
        </p>
      </section>

      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center pt-20 lg:min-h-screen lg:pt-0">
        <div className="w-full max-w-lg">
          <Surface className="p-6 sm:p-9">
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Secure access
            </p>
            <h1 className="text-navy mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="text-muted mt-3 leading-7">{description}</p>
            <div className="mt-7">{children}</div>
          </Surface>
          <p className="text-muted mt-5 text-center text-xs leading-5">
            Your developmental data remains private unless you deliberately
            publish selected Project proof.
          </p>
        </div>
      </section>
    </main>
  );
}
