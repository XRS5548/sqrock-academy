import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeftIcon,
  BroadcastIcon,
  CheckCircleIcon,
  ClockIcon,
  LockKeyIcon,
  SealCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { ExamRunner } from "@/components/course/exam-runner";
import {
  getCertificateForCourse,
  getCourseBySlug,
  getCourseProgress,
  getEnrollment,
  getExamForCourse,
  getLatestAttempt,
} from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser(`/dashboard/courses/${slug}/exam`);
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const enrollment = await getEnrollment(user.id, course.id);
  if (!enrollment) redirect(`/courses/${slug}`);

  const [exam, progressRows, certificate] = await Promise.all([
    getExamForCourse(course.id),
    getCourseProgress(user.id, course.id),
    getCertificateForCourse(user.id, course.id),
  ]);

  if (course.mode === "live") {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-background p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <BroadcastIcon size={28} weight="duotone" />
        </span>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {course.title}
        </p>
        <h1 className="mt-1 font-heading text-xl font-semibold">
          The course is still live
        </h1>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          New lessons are still being added to this course. The final exam will
          unlock automatically once the instructor finishes the course — your
          progress and any existing certificate stay exactly as they are.
        </p>
        <Button
          className="mt-5"
          size="lg"
          render={<Link href={`/dashboard/courses/${course.slug}`} />}
        >
          Back to course
        </Button>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-background p-8 text-center">
        <LockKeyIcon size={26} className="mx-auto text-muted-foreground" />
        <h1 className="mt-3 font-heading text-lg font-semibold">
          Exam not available yet
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          The course team is still preparing the final exam for this course.
        </p>
        <Button
          className="mt-5"
          render={<Link href={`/dashboard/courses/${course.slug}`} />}
        >
          Back to course
        </Button>
      </div>
    );
  }

  const lastAttempt = await getLatestAttempt(user.id, exam.id);
  const completedCount = progressRows.filter((p) => p.completed).length;
  const allDone =
    course.lessons.length > 0 && completedCount >= course.lessons.length;

  if (certificate || (lastAttempt && lastAttempt.passed)) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-background p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
          <SealCheckIcon size={30} weight="duotone" />
        </span>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {course.title}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold">
          Exam already passed
        </h1>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          You scored {lastAttempt?.score ?? certificate?.score ?? 0}% and your
          certificate is unlocked.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {certificate && (
            <Button
              size="lg"
              className="h-9 rounded-lg px-4 text-xs"
              render={<Link href={`/certificates/${certificate.certificateNo}`} />}
            >
              <SealCheckIcon data-icon="inline-start" />
              View certificate
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="h-9 rounded-lg px-4 text-xs"
            render={<Link href={`/dashboard/courses/${course.slug}`} />}
          >
            Back to course
          </Button>
        </div>
      </div>
    );
  }

  if (!allDone) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-background p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <LockKeyIcon size={28} />
        </span>
        <h1 className="mt-4 font-heading text-xl font-semibold">
          Finish the course first
        </h1>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          The final exam unlocks after every lesson is marked complete. You have
          completed {completedCount} of {course.lessons.length} lessons.
        </p>
        <div className="mx-auto mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${Math.round((completedCount / course.lessons.length) * 100)}%`,
            }}
          />
        </div>
        <Button
          className="mt-5"
          size="lg"
          render={<Link href={`/dashboard/courses/${course.slug}`} />}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Continue learning
        </Button>
      </div>
    );
  }

  if (lastAttempt && !lastAttempt.passed) {
    const availableAt = new Date(
      new Date(lastAttempt.submittedAt).getTime() +
        exam.lockHours * 60 * 60 * 1000,
    );
    if (availableAt > new Date()) {
      return (
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-background p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <ClockIcon size={28} />
          </span>
          <h1 className="mt-4 font-heading text-xl font-semibold">
            Exam locked for now
          </h1>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            You scored {lastAttempt.score}% on your last attempt — the pass mark
            is {exam.passPercent}%. Your next attempt unlocks on{" "}
            <span className="font-semibold text-foreground">
              {availableAt.toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            .
          </p>
          <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-5 rounded-lg border border-border bg-muted/30 px-5 py-3 text-left">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Last score
              </p>
              <p className="text-base font-semibold text-destructive">
                {lastAttempt.score}%
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Pass mark
              </p>
              <p className="text-base font-semibold">{exam.passPercent}%</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Lock
              </p>
              <p className="text-base font-semibold">{exam.lockHours}h</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="mt-5 h-9 rounded-lg px-4 text-xs"
            render={<Link href={`/dashboard/courses/${course.slug}`} />}
          >
            Review lessons
          </Button>
        </div>
      );
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/dashboard/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon size={11} /> Back to course
        </Link>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
          Final exam
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span>{exam.title}</span>
          <span className="inline-flex items-center gap-1">
            <CheckCircleIcon size={12} className="text-emerald-600" />
            {exam.questions.length} questions
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon size={12} /> {exam.timeLimitMinutes} minutes
          </span>
          <span className="inline-flex items-center gap-1">
            <WarningCircleIcon size={12} /> Pass {exam.passPercent}%
          </span>
        </p>
      </div>

      <ExamRunner exam={exam} courseTitle={course.title} courseSlug={course.slug} />
    </div>
  );
}
