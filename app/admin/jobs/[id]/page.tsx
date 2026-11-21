import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  BriefcaseIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  MoneyIcon,
  StarIcon,
  TagIcon,
  WalletIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobReviewActions } from "@/components/admin/job-review-actions";
import { getJobById } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  return { title: job ? `${job.title} · Admin` : "Job · Admin" };
}

const detailRows = [
  { key: "type", label: "Job type", icon: BriefcaseIcon },
  { key: "category", label: "Category", icon: TagIcon },
  { key: "experience", label: "Experience", icon: StarIcon },
  { key: "location", label: "Location", icon: MapPinIcon },
  { key: "workMode", label: "Work mode", icon: BuildingsIcon },
  { key: "salary", label: "Salary", icon: WalletIcon },
] as const;

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  const postedOn = new Date(job.createdAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-5">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon size={12} /> Back to job approvals
      </Link>

      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 font-heading text-xs font-semibold">
              {job.company.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-xl font-semibold tracking-tight">
                  {job.title}
                </h1>
                <Badge
                  variant={job.status === "approved" ? "secondary" : "outline"}
                  className="h-5 rounded-full px-2 text-[9px] capitalize"
                >
                  {job.status}
                </Badge>
                {job.featured && (
                  <Badge className="h-5 rounded-full px-2 text-[9px]">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{job.company}</p>
            </div>
          </div>
          <JobReviewActions jobId={job.id} />
        </div>

        <div className="mt-5 grid gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
          {detailRows.map(({ key, label, icon: Icon }) => {
            const value = job[key];
            return (
              <div key={key} className="flex items-start gap-2">
                <Icon
                  size={14}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium capitalize">
                    {value || "Not specified"}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="flex items-start gap-2">
            <CalendarBlankIcon
              size={14}
              className="mt-0.5 shrink-0 text-muted-foreground"
            />
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Posted on
              </p>
              <p className="mt-0.5 text-[11px] font-medium">{postedOn}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
          {job.applyUrl ? (
            <Button
              variant="outline"
              size="lg"
              render={
                <a href={job.applyUrl} target="_blank" rel="noreferrer" />
              }
            >
              <ArrowSquareOutIcon /> Apply link
            </Button>
          ) : null}
          {job.applyEmail ? (
            <Button
              variant="outline"
              size="lg"
              render={<a href={`mailto:${job.applyEmail}`} />}
            >
              <EnvelopeSimpleIcon /> {job.applyEmail}
            </Button>
          ) : null}
          {job.status === "approved" && (
            <Button
              variant="ghost"
              size="lg"
              render={<Link href={`/jobs/${job.id}`} target="_blank" />}
            >
              <ArrowSquareOutIcon /> View public page
            </Button>
          )}
        </div>

        {!job.applyUrl && !job.applyEmail && (
          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-700">
            <MoneyIcon size={12} /> No apply link or email was provided.
          </p>
        )}
      </div>

      <section className="rounded-xl border border-border bg-background p-5">
        <h2 className="font-heading text-sm font-semibold">
          Job description
        </h2>
        <div
          className="rich-text mt-3"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </section>
    </div>
  );
}
