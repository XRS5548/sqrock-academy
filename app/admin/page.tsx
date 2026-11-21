import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CertificateIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllCourses, getAllJobs, getAdminOverview } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";
import { formatPrice } from "@/components/site/course-card";

export default async function AdminOverviewPage() {
  const user = await requireAdmin();
  const [overview, courses, jobs] = await Promise.all([
    getAdminOverview(),
    getAllCourses(),
    getAllJobs(),
  ]);
  const pendingJobs = jobs.filter((jobItem) => jobItem.status === "pending");
  const recentCourses = courses.slice(0, 5);

  const stats = [
    { label: "Courses", value: overview.courses, icon: BookOpenIcon, note: "In the catalogue" },
    { label: "Students", value: overview.students, icon: UsersIcon, note: "Registered learners" },
    { label: "Enrollments", value: overview.enrollments, icon: CheckCircleIcon, note: "All time" },
    { label: "Certificates", value: overview.certificates, icon: CertificateIcon, note: "Exam-verified" },
    { label: "Pending jobs", value: overview.pendingJobs, icon: ClockIcon, note: "Awaiting review" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Admin workspace
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            Welcome, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage courses, review job posts and keep the academy running.
          </p>
        </div>
        <Button
          size="lg"
          className="h-9 w-fit rounded-lg px-3 text-xs"
          render={<Link href="/admin/courses/new" />}
        >
          <PlusIcon data-icon="inline-start" /> New course
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <Icon size={16} weight="duotone" />
              </span>
              <span className="font-heading text-xl font-semibold">{value}</span>
            </div>
            <p className="mt-3 text-[11px] font-semibold">{label}</p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="font-heading text-sm font-semibold">Recent courses</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Latest additions to the catalogue
              </p>
            </div>
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary"
            >
              Manage all <ArrowRightIcon size={10} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentCourses.map((courseItem) => (
              <div
                key={courseItem.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
                  {courseItem.title.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium">
                    {courseItem.title}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {courseItem.category} · {courseItem.lessons.length} lessons ·{" "}
                    {formatPrice(courseItem)}
                  </p>
                </div>
                <Badge
                  variant={courseItem.status === "published" ? "secondary" : "outline"}
                  className="h-5 shrink-0 px-2 text-[9px] capitalize"
                >
                  {courseItem.status}
                </Badge>
                <Link
                  href={`/admin/courses/${courseItem.id}/edit`}
                  className="text-[10px] font-semibold text-primary"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-heading text-sm font-semibold">
                Job approvals
              </h2>
              <Badge
                variant="outline"
                className="h-5 rounded-full px-2 text-[9px]"
              >
                {pendingJobs.length} pending
              </Badge>
            </div>
            <div className="divide-y divide-border">
              {pendingJobs.slice(0, 3).map((jobItem) => (
                <div key={jobItem.id} className="px-4 py-3">
                  <p className="truncate text-[11px] font-medium">
                    {jobItem.title}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {jobItem.company} · {jobItem.type}
                  </p>
                </div>
              ))}
              {pendingJobs.length === 0 && (
                <p className="px-4 py-6 text-center text-[10px] text-muted-foreground">
                  No pending job posts. All caught up.
                </p>
              )}
            </div>
            <div className="border-t border-border p-3">
              <Button
                variant="outline"
                size="lg"
                className="h-8 w-full rounded-lg text-[11px]"
                render={<Link href="/admin/jobs" />}
              >
                Review job posts <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
            <div className="flex items-start gap-2.5">
              <BriefcaseIcon size={16} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-[11px] font-semibold">Quick tips</p>
                <ul className="mt-1.5 space-y-1 text-[10px] leading-4 text-muted-foreground">
                  <li>• Publish a course only when all lessons have video links.</li>
                  <li>• Add exam questions so students can unlock certificates.</li>
                  <li>• Verify companies before approving job posts.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
