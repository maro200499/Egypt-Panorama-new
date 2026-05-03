import "./admin-dashboard.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_SESSION_COOKIE, verifySignedSessionCookie } from "@/lib/authSession";
import AdminEntityManager from "@/components/admin/AdminEntityManager";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const session = verifySignedSessionCookie(cookieStore.get(AUTH_SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/auth/login?next=/admin");
  }

  if (session.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="admin-dashboard min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="admin-panel admin-shimmer admin-reveal rounded-3xl p-5 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--admin-primary)" }}>
                Operations Center
              </p>
              <h1 className="admin-title text-2xl font-black text-stone-900 md:text-4xl">Egypt Panorama Admin Management</h1>
              <p className="admin-slab max-w-2xl text-sm text-stone-700 md:text-base">
                Add, update, and delete activities or destinations from a single control surface. The dashboard writes directly to the MySQL backend used by the public app.
              </p>
            </div>
            <div className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 shadow-sm">
              Authenticated session active
            </div>
          </div>
        </header>

        <AdminEntityManager />
      </section>
    </main>
  );
}
