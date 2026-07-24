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
      className="mx-auto min-h-screen max-w-lg px-5 py-10"
    >
      <div className="mb-8 flex justify-center">
        <BrandMark />
      </div>
      <Surface className="p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted mt-3 leading-7">{description}</p>
        <div className="mt-7">{children}</div>
      </Surface>
    </main>
  );
}
