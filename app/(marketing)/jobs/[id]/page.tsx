import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  WalletIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJobById } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  return {
    title: job ? `${job.title} at ${job.company}` : "Job",
    description: job?.description.replace(/<[^>]+>/g, "").slice(0, 150),
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon size={12} /> Back to all jobs
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 font-heading text-sm font-semibold">
              {job.company.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  {job.title}
                </h1>
                <Badge
                  variant="outline"
                  className="h-5 rounded-full px-2 text-[10px] capitalize"
                >
                  {job.type}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon size={14} /> {job.location} · {job.workMode}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseIcon size={14} /> {job.experience}
            </span>
            {job.salary && (
              <span className="inline-flex items-center gap-1.5">
                <WalletIcon size={14} /> {job.salary}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlankIcon size={14} /> Posted{" "}
              {new Date(job.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <div
            className="rich-text mt-6"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />

          <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
            <p className="text-xs font-semibold">About the company</p>
            <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
              {job.company} is hiring through the Sqrock Academy jobs board. The
              company has been verified by our team. Sqrock Academy never charges
              candidates for applications.
            </p>
          </div>
        </div>

        <aside>
          <div className="sticky top-24 space-y-3 rounded-xl border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Apply for this role
            </p>
            {job.applyUrl ? (
              <Button
                size="lg"
                className="h-10 w-full rounded-lg text-xs"
                render={
                  <a href={job.applyUrl} target="_blank" rel="noreferrer" />
                }
              >
                Apply on company site
                <ArrowUpRightIcon data-icon="inline-end" />
              </Button>
            ) : job.applyEmail ? (
              <Button
                size="lg"
                className="h-10 w-full rounded-lg text-xs"
                render={<a href={`mailto:${job.applyEmail}`} />}
              >
                Apply by email
                <EnvelopeSimpleIcon data-icon="inline-end" />
              </Button>
            ) : (
              <Button size="lg" className="h-10 w-full rounded-lg text-xs" disabled>
                Applications closed
              </Button>
            )}
            <p className="flex items-start gap-2 text-[10px] leading-5 text-muted-foreground">
              <BuildingsIcon size={13} className="mt-0.5 shrink-0" />
              Mention Sqrock Academy when you apply — it helps our team track
              outcomes.
            </p>
            <div className="border-t border-border pt-3">
              <Link
                href="/jobs/post"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Post a role for your company →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
