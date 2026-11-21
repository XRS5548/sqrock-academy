import {
  BriefcaseIcon,
  ClockIcon,
} from "@phosphor-icons/react/ssr";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminJobRow } from "@/components/admin/admin-job-row";
import { getAllJobs } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export default async function AdminJobsPage() {
  await requireAdmin();
  const jobs = await getAllJobs();
  const pending = jobs.filter((job) => job.status === "pending");
  const others = jobs.filter((job) => job.status !== "pending");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Job approvals
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Verify companies before approving. Approved jobs appear on the public
          jobs board immediately. Click any row to see the full job details.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2 text-[11px] font-medium text-amber-700">
          <ClockIcon size={14} /> {pending.length} pending review
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[11px] text-muted-foreground">
          <BriefcaseIcon size={14} /> {jobs.length} total posts
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="border-b border-border p-4">
          <h2 className="font-heading text-sm font-semibold">Pending review</h2>
        </div>
        {pending.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((job) => (
                <AdminJobRow key={job.id} job={job} variant="pending" />
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="px-4 py-10 text-center text-[11px] text-muted-foreground">
            No pending posts. You&apos;re all caught up.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="border-b border-border p-4">
          <h2 className="font-heading text-sm font-semibold">All job posts</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {others.map((job) => (
              <AdminJobRow key={job.id} job={job} variant="reviewed" />
            ))}
          </TableBody>
        </Table>
        {others.length === 0 && (
          <p className="px-4 py-8 text-center text-[10px] text-muted-foreground">
            No reviewed posts yet.
          </p>
        )}
      </section>
    </div>
  );
}
