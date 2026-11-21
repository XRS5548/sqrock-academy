import Link from "next/link";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ClockIcon,
  MapPinIcon,
  WalletIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import type { JobView } from "@/lib/types";
import { cn } from "@/lib/utils";

function timeAgo(date: Date) {
  const days = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return "Posted today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function JobCard({
  job,
  className,
}: {
  job: JobView;
  className?: string;
}) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/[0.03] transition-all duration-200 hover:border-foreground/20 hover:shadow-[0_14px_32px_-26px_rgba(15,23,42,0.4)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 font-heading text-sm font-semibold text-foreground">
            {job.company.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-sm font-semibold leading-tight tracking-tight group-hover:text-primary">
                {job.title}
              </h3>
              {job.featured && (
                <Badge
                  variant="secondary"
                  className="h-4 bg-primary/10 text-[9px] text-primary"
                >
                  Featured
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="h-5 shrink-0 rounded-full px-2 text-[10px] capitalize"
        >
          {job.type}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPinIcon size={12} />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <BriefcaseIcon size={12} />
          {job.experience}
        </span>
        {job.salary && (
          <span className="inline-flex items-center gap-1">
            <WalletIcon size={12} />
            {job.salary}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <ClockIcon size={12} />
          {timeAgo(job.createdAt)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-border/70 pt-3">
        <span className="text-[11px] font-medium text-muted-foreground">
          {job.workMode} · {job.category}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
          View role <ArrowRightIcon size={12} weight="bold" />
        </span>
      </div>
    </Link>
  );
}
