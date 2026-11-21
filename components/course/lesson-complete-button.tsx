"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/lib/actions";

export function LessonCompleteButton({
  lessonId,
  courseId,
  completed,
}: {
  lessonId: string;
  courseId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      variant={completed ? "outline" : "default"}
      className="h-9 rounded-lg px-3 text-xs"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await markLessonComplete(
            lessonId,
            courseId,
            !completed,
          );
          if (result.ok) {
            toast.success(
              completed ? "Marked as not completed." : "Lesson completed!",
            );
            router.refresh();
          } else {
            toast.error(result.error ?? "Could not update progress.");
          }
        })
      }
    >
      {completed ? (
        <>
          <CheckCircleIcon data-icon="inline-start" weight="fill" />
          Completed
        </>
      ) : (
        <>
          <CircleIcon data-icon="inline-start" />
          {pending ? "Saving…" : "Mark complete"}
        </>
      )}
    </Button>
  );
}
