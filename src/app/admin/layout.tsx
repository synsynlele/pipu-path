import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#020817]">
      <nav
        aria-label="PipuPath administration"
        className="border-b border-white/10 bg-[#061027] px-5 py-3 text-sm sm:px-8 lg:px-10"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4">
          <Link href="/admin" className="font-semibold text-white">
            Mission Control
          </Link>
          <Link href="/admin/institutions" className="text-blue-100">
            Institutions
          </Link>
          <Link href="/admin/opportunities" className="text-blue-100">
            Opportunities
          </Link>
          <Link href="/app" className="ml-auto text-blue-100">
            Back to PipuPath
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
