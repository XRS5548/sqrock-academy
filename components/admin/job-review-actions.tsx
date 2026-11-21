"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reviewJob, deleteJob } from "@/lib/actions";

export function JobReviewActions({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function review(decision: "approved" | "rejected") {
    startTransition(async () => {
      const result = await reviewJob(jobId, decision);
      if (result.ok) {
        toast.success(`Job ${decision}.`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not update.");
      }
    });
  }

  function remove() {
    if (!window.confirm("Delete this job post permanently?")) return;
    startTransition(async () => {
      const result = await deleteJob(jobId);
      if (result.ok) {
        toast.success("Job deleted.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not delete.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        size="sm"
        className="h-7 gap-1 bg-emerald-600 px-2 text-[10px] text-white hover:bg-emerald-700"
        disabled={pending}
        onClick={() => review("approved")}
      >
        <CheckIcon size={11} /> Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 px-2 text-[10px]"
        disabled={pending}
        onClick={() => review("rejected")}
      >
        <XIcon size={11} /> Reject
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-destructive"
        disabled={pending}
        onClick={remove}
        aria-label="Delete job"
      >
        <TrashIcon />
      </Button>
    </div>
  );
}
