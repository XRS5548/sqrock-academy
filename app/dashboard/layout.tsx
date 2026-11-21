import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/dashboard");
  return (
    <DashboardShell
      variant="student"
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </DashboardShell>
  );
}
