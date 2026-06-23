import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <main className="min-h-screen bg-slate-50">
      {session?.user ? (
        <nav className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/admin" className="text-lg font-semibold">Refund Ops</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/admin/logs">Logs</Link>
              <Link href="/admin/refunds">Refunds</Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/admin/login" });
                }}
              >
                <button className="text-slate-600 hover:text-slate-900">Sign out</button>
              </form>
            </div>
          </div>
        </nav>
      ) : null}
      {children}
    </main>
  );
}
