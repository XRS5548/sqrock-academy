"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { JobReviewActions } from "@/components/admin/job-review-actions";
import type { JobView } from "@/lib/types";

export function AdminJobRow({
  job,
  variant,
}: {
  job: JobView;
  variant: "pending" | "reviewed";
}) {
  const router = useRouter();
  const href = `/admin/jobs/${job.id}`;

  return (
    <TableRow
      tabIndex={0}
      aria-label={`View details for ${job.title}`}
      className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(href);
        }
      }}
    >
      <TableCell className="px-4 py-3">
        <p className="text-[11px] font-semibold">{job.title}</p>
        <p className="text-[9px] text-muted-foreground">
          {job.location} ·{" "}
          {variant === "pending"
            ? job.workMode
            : (job.salary ?? "Salary not listed")}
        </p>
      </TableCell>
      <TableCell className="text-[10px]">{job.company}</TableCell>
      <TableCell>
        {variant === "pending" ? (
          <Badge variant="outline" className="h-5 px-2 text-[9px] capitalize">
            {job.type}
          </Badge>
        ) : (
          <Badge
            variant={job.status === "approved" ? "secondary" : "outline"}
            className="h-5 px-2 text-[9px] capitalize"
          >
            {job.status}
          </Badge>
        )}
      </TableCell>
      <TableCell
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <JobReviewActions jobId={job.id} />
      </TableCell>
    </TableRow>
  );
}
