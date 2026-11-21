import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  DownloadSimpleIcon,
  FilePdfIcon,
  LockKeyIcon,
  PaperclipIcon,
  PlayCircleIcon,
  SealCheckIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonCompleteButton } from "@/components/course/lesson-complete-button";
import {
  getCertificateForCourse,
  getCourseBySlug,
  getCourseProgress,
  getEnrollment,
  getExamForCourse,
} from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { normalizeVideoUrl } from "@/lib/video";
import { cn } from "@/lib/utils";

export default async function CoursePlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { slug } = await params;
  const { lesson: lessonParam } = await searchParams;
  const user = await requireUser(`/dashboard/courses/${slug}`);

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const enrollment = await getEnrollment(user.id, course.id);
  if (!enrollment) redirect(`/courses/${slug}`);

  const [progressRows, certificate, exam] = await Promise.all([
    getCourseProgress(user.id, course.id),
    getCertificateForCourse(user.id, course.id),
    getExamForCourse(course.id),
  ]);

  const completedIds = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.lessonId),
  );
  const completedCount = course.lessons.filter((l) =>
    completedIds.has(l.id),
  ).length;
  const progress =
    course.lessons.length === 0
      ? 0
      : Math.round((completedCount / course.lessons.length) * 100);

  const activeLesson =
    course.lessons.find((l) => l.id === lessonParam) ??
    course.lessons.find((l) => !completedIds.has(l.id)) ??
    course.lessons[0];

  const video = activeLesson
    ? normalizeVideoUrl(activeLesson.videoUrl, activeLesson.videoType)
    : null;

  const allDone =
    course.lessons.length > 0 && completedCount >= course.lessons.length;
  // Live courses keep the final exam locked until the instructor finishes the
  // course and converts it to a recorded course.
  const examOpen = allDone && course.mode !== "live";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon size={11} /> My courses
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-lg font-semibold leading-tight tracking-tight">
              {course.title}
            </h1>
            {course.mode === "live" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                Live · new lessons added
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28">
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>{progress}%</span>
              <span>
                {completedCount}/{course.lessons.length}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_310px]">
        <div className="min-w-0 space-y-4">
          {/* Video */}
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="aspect-video w-full bg-foreground/95">
              {video ? (
                video.kind === "youtube" ? (
                  <iframe
                    key={activeLesson?.id}
                    src={video.src}
                    title={activeLesson?.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={activeLesson?.id}
                    src={video.src}
                    controls
                    className="h-full w-full"
                  />
                )
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-background/60">
                  <PlayCircleIcon size={34} />
                  <p className="text-[11px]">
                    {course.lessons.length === 0
                      ? "Lessons are being added to this course."
                      : "This lesson has no video URL yet."}
                  </p>
                </div>
              )}
            </div>

            {activeLesson && (
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Lesson {activeLesson.position} of {course.lessons.length}
                    </p>
                    <h2 className="mt-1 font-heading text-base font-semibold">
                      {activeLesson.title}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <ClockIcon size={11} /> {activeLesson.durationMinutes} min
                    </p>
                  </div>
                  <LessonCompleteButton
                    lessonId={activeLesson.id}
                    courseId={course.id}
                    completed={completedIds.has(activeLesson.id)}
                  />
                </div>

                {activeLesson.description && (
                  <p className="mt-4 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
                    {activeLesson.description}
                  </p>
                )}

                {activeLesson.attachments.length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      <PaperclipIcon size={12} /> Lesson resources
                    </p>
                    <div className="mt-2 space-y-2">
                      {activeLesson.attachments.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/40"
                        >
                          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <FilePdfIcon size={14} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                            {file.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {file.fileType}
                          </span>
                          <DownloadSimpleIcon
                            size={13}
                            className="text-muted-foreground"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Exam / certificate */}
          <div className="rounded-xl border border-border bg-background p-5">
            {certificate ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700">
                    <SealCheckIcon size={20} weight="duotone" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">
                      Course complete — certificate unlocked
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Your certificate ID is {certificate.certificateNo}.
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="h-9 shrink-0 rounded-lg px-3 text-xs"
                  render={
                    <Link href={`/certificates/${certificate.certificateNo}`} />
                  }
                >
                  View certificate <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      examOpen
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {examOpen ? (
                      <SealCheckIcon size={20} weight="duotone" />
                    ) : (
                      <LockKeyIcon size={19} />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-semibold">
                      {examOpen
                        ? "All lessons complete — take the final exam"
                        : course.mode === "live"
                          ? "Final exam opens when the course is complete"
                          : "Final exam locked"}
                    </p>
                    <p className="mt-1 max-w-md text-[11px] leading-5 text-muted-foreground">
                      {examOpen
                        ? `Score ${exam?.passPercent ?? course.examPassPercent}% or more to unlock your certificate.`
                        : course.mode === "live"
                          ? "This is a live course and new lessons are still being added. The instructor will close the course once every lesson is published, and the exam will unlock for you then."
                          : `Finish all ${course.lessons.length} lessons to unlock the exam. You've completed ${completedCount}.`}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="h-9 shrink-0 rounded-lg px-3 text-xs"
                  disabled={!examOpen}
                  render={
                    examOpen ? (
                      <Link href={`/dashboard/courses/${course.slug}/exam`} />
                    ) : undefined
                  }
                >
                  Take final exam <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Lesson list */}
        <aside className="rounded-xl border border-border bg-background">
          <div className="border-b border-border p-4">
            <p className="text-xs font-semibold">Course content</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {course.lessons.length} lessons ·{" "}
              {Math.round(course.durationMinutes / 60)}h total
            </p>
          </div>
          <div className="max-h-[560px] overflow-y-auto p-2">
            {course.lessons.map((item) => {
              const isDone = completedIds.has(item.id);
              const isActive = activeLesson?.id === item.id;
              return (
                <Link
                  key={item.id}
                  href={`/dashboard/courses/${course.slug}?lesson=${item.id}`}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg p-2.5 transition-colors",
                    isActive ? "bg-muted" : "hover:bg-muted/50",
                  )}
                >
                  {isDone ? (
                    <CheckCircleIcon
                      size={15}
                      weight="fill"
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  ) : (
                    <CircleIcon
                      size={15}
                      className="mt-0.5 shrink-0 text-muted-foreground/60"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[11px] leading-4",
                        isActive ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      {item.durationMinutes} min
                      {item.attachments.length > 0 &&
                        ` · ${item.attachments.length} files`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          {progress === 100 && (
            <div className="border-t border-border p-3">
              <Badge className="h-5 w-full justify-center bg-emerald-600/10 text-[9px] text-emerald-700">
                100% complete
              </Badge>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
