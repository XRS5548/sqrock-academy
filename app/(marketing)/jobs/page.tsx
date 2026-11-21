import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingsIcon,
  MagnifyingGlassIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/site/job-card";
import { getApprovedJobs } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Jobs & internships",
  description:
    "Fresh developer, data, cloud and marketing jobs and internships — checked daily by the Sqrock Academy team.",
};

const typeFilters = [
  { label: "All roles", value: "all" },
  { label: "Jobs", value: "job" },
  { label: "Internships", value: "internship" },
];

const categoryFilters = [
  "All",
  "Engineering",
  "Data",
  "Cloud",
  "Game Development",
  "Marketing",
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const type = sp.type ?? "all";
  const category = sp.category ?? "All";
  const q = (sp.q ?? "").trim().toLowerCase();

  const allJobs = await getApprovedJobs();
  const jobs = allJobs.filter((job) => {
    if (type !== "all" && job.type !== type) return false;
    if (category !== "All" && job.category !== category) return false;
    if (
      q &&
      !`${job.title} ${job.company} ${job.location} ${job.category}`
        .toLowerCase()
        .includes(q)
    )
      return false;
    return true;
  });

  const query = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { type, category, q, ...updates };
    Object.entries(merged).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "All") params.set(key, value);
    });
    const qs = params.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Badge
                variant="outline"
                className="h-6 rounded-full border-border bg-background/80 px-3 text-[10px]"
              >
                <SparkleIcon size={11} className="text-primary" /> Updated daily
                by our team
              </Badge>
              <h1 className="mt-4 max-w-2xl font-heading text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
                Jobs & internships
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Real openings at verified companies. Apply directly — no
                middlemen, no fees. Companies can post a role for free after
                verification.
              </p>
            </div>
            <Button
              size="lg"
              className="h-10 w-fit rounded-lg px-4 text-sm"
              render={<Link href="/jobs/post" />}
            >
              Post a job
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>

          <form action="/jobs" className="mt-7 flex max-w-xl gap-2">
            {type !== "all" && <input type="hidden" name="type" value={type} />}
            <div className="relative flex-1">
              <MagnifyingGlassIcon
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Search role, company or location"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-10 rounded-lg px-4 text-sm"
            >
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {typeFilters.map((filter) => (
              <Link
                key={filter.value}
                href={query({ type: filter.value })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                  type === filter.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categoryFilters.map((item) => (
              <Link
                key={item}
                href={query({ category: item })}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-muted",
                  category === item
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{jobs.length}</span>{" "}
          opening{jobs.length === 1 ? "" : "s"} found
        </p>

        {jobs.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <BuildingsIcon size={26} className="text-muted-foreground" />
            <h2 className="mt-3 font-heading text-base font-semibold">
              No openings in this filter right now
            </h2>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              New roles are added every day. Try another category or check back
              tomorrow.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="mt-4 h-9 rounded-lg text-xs"
              render={<Link href="/jobs" />}
            >
              See all openings
            </Button>
          </div>
        )}

        <div className="mt-12 grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-3">
          {[
            {
              title: "Verified companies",
              body: "Every company is checked by our team before a role goes live.",
            },
            {
              title: "No posting fees",
              body: "Companies can post jobs and internships for free.",
            },
            {
              title: "Direct applications",
              body: "Apply straight to the company — we never charge candidates.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <BriefcaseIcon size={16} weight="duotone" />
              </span>
              <div>
                <p className="text-xs font-semibold">{item.title}</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
