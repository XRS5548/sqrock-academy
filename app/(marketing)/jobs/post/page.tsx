import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeftIcon,
  BuildingsIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/ssr";
import { JobPostForm } from "@/components/jobs/job-post-form";
import { site } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Post a job",
  description:
    "Post a job or internship for your company on Sqrock Academy. Free after company verification.",
};

export default function JobPostPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon size={12} /> Jobs board
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Post a job or internship
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Free for verified companies. Reach learners who are actively
            building job-ready skills. Our team reviews every submission before
            it appears on the board.
          </p>
          <div className="mt-6">
            <JobPostForm />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-5">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <ShieldCheckIcon size={16} className="text-primary" />
              How verification works
            </p>
            <ol className="mt-3 space-y-3">
              {[
                "Submit the role with a company email",
                "Our team checks the company website and role",
                "Approved posts go live and are visible to all learners",
              ].map((step, index) => (
                <li key={step} className="flex gap-2.5 text-[11px] leading-5 text-muted-foreground">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[9px] font-semibold">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-border p-5">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <ClockIcon size={15} className="text-muted-foreground" />
              Review time
            </p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              Most posts are reviewed within 24 hours on working days.
            </p>
          </div>

          <div className="rounded-xl border border-border p-5">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <BuildingsIcon size={15} className="text-muted-foreground" />
              Need help?
            </p>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
              Email{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-foreground underline underline-offset-2"
              >
                {site.email}
              </a>{" "}
              with the company details and we&apos;ll help you get listed.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-primary/[0.04] p-5">
            <p className="flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
              <CheckCircleIcon size={15} className="mt-0.5 shrink-0 text-emerald-600" />
              Posting is free. We never charge candidates and never sell
              applicant data.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
