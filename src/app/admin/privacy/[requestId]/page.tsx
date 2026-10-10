import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getCurrentPlatformAdminRole } from "@/modules/admin/infrastructure/admin-dal";
import { getDeletionInventory } from "@/modules/privacy/infrastructure/deletion-preflight";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Deletion inventory",
  robots: { index: false, follow: false },
};

export default async function DeletionInventoryPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const role = await getCurrentPlatformAdminRole();
  if (role !== "owner" && role !== "operator") notFound();
  const { requestId } = await params;
  if (!z.uuid().safeParse(requestId).success) notFound();
  const inventory = await getDeletionInventory(requestId);
  return (
    <main className="mx-auto max-w-4xl p-6 text-white">
      <Link href="/admin/privacy" className="underline">
        Back to requests
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Deletion inventory</h1>
      <p className="mt-4 leading-7">
        Read-only check. Nothing has been deleted. Counts cover direct account
        references and owned storage objects; nested records, shared snapshots,
        retention exceptions and provider logs still require review.
      </p>
      <p className="mt-4 break-all">Request: {inventory.requestId}</p>
      <p className="mt-2">
        Account exists: {inventory.accountPresent ? "Yes" : "No"} · Storage
        objects: {inventory.storageObjects}
      </p>
      <p className="mt-4 leading-7">
        Restrict or no-action references can block deletion. Set-null references
        may retain personal content after the account is removed. Cascade counts
        are per reference and must not be added together as unique records.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="mb-3 text-left">
            Direct database dependencies
          </caption>
          <thead>
            <tr>
              <th className="p-2">Table</th>
              <th className="p-2">Reference</th>
              <th className="p-2">Rows</th>
              <th className="p-2">Delete rule</th>
            </tr>
          </thead>
          <tbody>
            {inventory.relations.map((row) => (
              <tr
                key={`${row.table}.${row.column}`}
                className="border-t border-white/20"
              >
                <td className="p-2">{row.table}</td>
                <td className="p-2">{row.column}</td>
                <td className="p-2">{row.count}</td>
                <td className="p-2">{row.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 leading-7">
        This inventory does not authorise deletion or mark the request
        fulfilled. Follow the approved privacy runbook and verify every removal.
      </p>
    </main>
  );
}
