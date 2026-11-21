import Link from "next/link";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingsIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react/ssr";
import { JobCard } from "@/components/site/job-card";
import { getApprovedJobs } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function DashboardJobsPage() {
  await requireUser("/dashboard/jobs");
  const jobs = await getApprovedJobs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Jobs for you
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Fresh openings from verified companies, updated by our team every
            day.
          </p>
        </div>
        <Link
          href="/jobs/post"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
        >
          Post a role for your company <ArrowRightIcon size={11} />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "Verified companies",
            body: "Every employer is checked before listing.",
            icon: BuildingsIcon,
          },
          {
            title: "Direct applications",
            body: "Apply straight to the company, never through us.",
            icon: BriefcaseIcon,
          },
          {
            title: "Free for everyone",
            body: "No fees for candidates or companies.",
            icon: CheckCircleIcon,
          },
        ].map(({ icon: Icon, ...item }) => (
          <div
            key={item.title}
            className="flex items-start gap-2.5 rounded-lg border border-border bg-background p-3.5"
          >
            <Icon size={16} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-[11px] font-semibold">{item.title}</p>
              <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
