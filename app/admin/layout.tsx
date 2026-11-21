import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <DashboardShell
      variant="admin"
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </DashboardShell>
  );
}
