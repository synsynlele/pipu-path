import { ButtonLink } from "@/components/ui/button";

export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pt-5 sm:px-8 lg:px-10">
        <ButtonLink href="/connect" variant="ghost">
          Builder Network
        </ButtonLink>
        <ButtonLink href="/connect/collaborations" variant="ghost">
          Collaborations
        </ButtonLink>
      </div>
      {children}
    </div>
  );
}
