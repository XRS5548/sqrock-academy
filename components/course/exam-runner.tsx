"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  SealCheckIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitExamAttempt } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { ExamView } from "@/lib/types";

type Result = {
  passed: boolean;
  score: number;
  certificateNo?: string;
  lockedUntil?: string;
};

export function ExamRunner({
  exam,
  courseTitle,
  courseSlug,
}: {
  exam: ExamView;
  courseTitle: string;
  courseSlug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<number[]>(
    new Array(exam.questions.length).fill(-1),
  );
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(exam.timeLimitMinutes * 60);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (result) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result]);

  function submit() {
    if (pending || result) return;
    if (answers.some((a) => a === -1)) {
      const proceed = window.confirm(
        "You have unanswered questions. Submit anyway?",
      );
      if (!proceed) return;
    }
    startTransition(async () => {
      const response = await submitExamAttempt(exam.courseId, answers);
      if (response.ok && response.passed !== undefined) {
        setResult({
          passed: Boolean(response.passed),
          score: response.score ?? 0,
          certificateNo: response.certificateNo,
          lockedUntil: response.lockedUntil,
        });
        router.refresh();
      } else {
        toast.error(response.error ?? "Could not submit exam.");
      }
    });
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-border bg-background p-8 text-center">
          <span
            className={cn(
              "mx-auto flex size-14 items-center justify-center rounded-full",
              result.passed
                ? "bg-emerald-600/10 text-emerald-700"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {result.passed ? (
              <SealCheckIcon size={30} weight="duotone" />
            ) : (
              <XCircleIcon size={30} weight="duotone" />
            )}
          </span>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {courseTitle}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">
            {result.passed ? "You passed!" : "Not quite there yet"}
          </h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            {result.passed
              ? "Your certificate is unlocked. You can view, print and share it right away."
              : `You scored below the ${exam.passPercent}% pass mark. Your next attempt unlocks after ${exam.lockHours} hours.`}
          </p>

          <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-6 rounded-xl border border-border bg-muted/30 px-6 py-4">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Your score
              </p>
              <p
                className={cn(
                  "mt-0.5 font-heading text-2xl font-semibold",
                  result.passed ? "text-emerald-700" : "text-destructive",
                )}
              >
                {result.score}%
              </p>
            </div>
            <div className="h-9 w-px bg-border" />
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Pass mark
              </p>
              <p className="mt-0.5 font-heading text-2xl font-semibold">
                {exam.passPercent}%
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {result.passed && result.certificateNo ? (
              <Button
                size="lg"
                className="h-9 rounded-lg px-4 text-xs"
                render={
                  <Link href={`/certificates/${result.certificateNo}`} />
                }
              >
                <SealCheckIcon data-icon="inline-start" />
                View certificate
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="lg"
              className="h-9 rounded-lg px-4 text-xs"
              render={<Link href={`/dashboard/courses/${courseSlug}`} />}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Back to course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = exam.questions[index];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const answered = answers.filter((a) => a !== -1).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {courseTitle}
          </p>
          <p className="text-xs font-semibold">{exam.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
              secondsLeft < 60
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-border bg-muted/40 text-foreground",
            )}
          >
            <ClockIcon size={12} />
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {answered}/{exam.questions.length} answered
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Question {index + 1} of {exam.questions.length}
        </p>
        <h2 className="mt-2 font-heading text-base font-semibold leading-snug">
          {question.question}
        </h2>

        <div className="mt-5 space-y-2">
          {question.options.map((option, optionIndex) => {
            const selected = answers[index] === optionIndex;
            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() =>
                  setAnswers((prev) => {
                    const copy = [...prev];
                    copy[index] = optionIndex;
                    return copy;
                  })
                }
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/[0.05]"
                    : "border-border hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="text-xs leading-5">{option}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            size="lg"
            className="h-9 rounded-lg px-3 text-xs"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            <ArrowLeftIcon data-icon="inline-start" /> Previous
          </Button>

          {index < exam.questions.length - 1 ? (
            <Button
              size="lg"
              className="h-9 rounded-lg px-3 text-xs"
              onClick={() =>
                setIndex((i) => Math.min(exam.questions.length - 1, i + 1))
              }
            >
              Next <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="h-9 rounded-lg px-4 text-xs"
              onClick={submit}
              disabled={pending}
            >
              {pending ? "Submitting…" : "Submit exam"}
              <CheckCircleIcon data-icon="inline-end" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Question palette
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {exam.questions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "flex size-7 items-center justify-center rounded-md border text-[10px] font-medium transition-colors",
                i === index
                  ? "border-foreground bg-foreground text-background"
                  : answers[i] !== -1
                    ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-700"
                    : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-muted-foreground">
          <WarningCircleIcon size={12} className="mt-0.5 shrink-0" />
          The exam auto-submits when the timer ends. You need{" "}
          {exam.passPercent}% to pass. Failed attempts lock the exam for{" "}
          {exam.lockHours} hours.
        </p>
      </div>
    </div>
  );
}
