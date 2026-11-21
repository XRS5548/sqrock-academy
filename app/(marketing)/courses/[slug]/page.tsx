import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BroadcastIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  GlobeIcon,
  LockKeyIcon,
  MedalIcon,
  PaperclipIcon,
  PlayCircleIcon,
  SealCheckIcon,
  StarIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard, formatDuration, formatPrice } from "@/components/site/course-card";
import { CourseCover } from "@/components/site/course-cover";
import { EnrollButton } from "@/components/course/enroll-button";
import { CoursePreviewVideo } from "@/components/course/course-preview-video";
import { getCourseBySlug, getEnrollment, getRelatedCourses } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return {
    title: course?.title ?? "Course",
    description: course?.subtitle ?? undefined,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-3xl font-semibold">Course not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This course may have been moved or is no longer available.
        </p>
        <Button className="mt-6" render={<Link href="/courses" />}>
          Browse all courses
        </Button>
      </div>
    );
  }

  const [user, related] = await Promise.all([
    getCurrentUser(),
    getRelatedCourses(course.category, course.slug),
  ]);
  const enrollment = user ? await getEnrollment(user.id, course.id) : null;

  const totalLessons = course.lessons.length;
  const previewLesson = course.lessons.find((l) => l.isPreview) ?? course.lessons[0];
  const attachmentCount = course.lessons.reduce(
    (sum, l) => sum + l.attachments.length,
    0,
  );

  return (
    <div className="bg-background">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon size={12} /> All courses
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="h-5 rounded-full px-2.5 text-[10px]">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="h-5 rounded-full px-2.5 text-[10px]">
                  {course.level}
                </Badge>
                {course.mode === "live" && (
                  <Badge className="h-5 rounded-full bg-amber-500 px-2.5 text-[10px] text-white">
                    Live course
                  </Badge>
                )}
                {course.isFree && (
                  <Badge className="h-5 rounded-full bg-emerald-600 px-2.5 text-[10px] text-white">
                    Free
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-[1.12] tracking-tight sm:text-[2.6rem]">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
                {course.subtitle}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <StarIcon size={13} weight="fill" className="text-amber-500" />
                  {(course.rating / 10).toFixed(1)} rating
                </span>
                <span className="inline-flex items-center gap-1">
                  <UsersIcon size={13} /> {course.enrollments.toLocaleString("en-IN")} learners
                </span>
                <span className="inline-flex items-center gap-1">
                  <ClockIcon size={13} /> {formatDuration(course.durationMinutes)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpenIcon size={13} /> {totalLessons} lessons
                </span>
                <span className="inline-flex items-center gap-1">
                  <GlobeIcon size={13} /> {course.language}
                </span>
              </div>

              {course.mode === "live" && (
                <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3">
                  <BroadcastIcon
                    size={16}
                    weight="duotone"
                    className="mt-0.5 shrink-0 text-amber-600"
                  />
                  <div>
                    <p className="text-[11px] font-semibold text-amber-800">
                      Live course — new lessons are added regularly
                    </p>
                    <p className="mt-0.5 text-[11px] leading-5 text-amber-800/80">
                      You get access to everything published so far, and new
                      lessons appear on this page as they are uploaded. The final
                      exam opens once the course is completed by the instructor.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  {course.instructorName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <p className="text-xs font-semibold">{course.instructorName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {course.instructorRole}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase card */}
            <div className="lg:-mb-16">
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] lg:sticky lg:top-24">
                <CourseCover
                  title={course.title}
                  category={course.category}
                  slug={course.slug}
                  thumbnail={course.thumbnail}
                />
                <div className="p-5">
                  <div className="flex items-end justify-between">
                    <p className="font-heading text-2xl font-semibold">
                      {formatPrice(course)}
                    </p>
                    {!course.isFree && course.price > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        Secure Razorpay checkout
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <EnrollButton
                      courseId={course.id}
                      slug={course.slug}
                      enrolled={Boolean(enrollment)}
                      isFree={course.isFree}
                      price={course.price}
                      isLoggedIn={Boolean(user)}
                    />
                  </div>

                  <div className="mt-5 space-y-2.5 border-t border-border pt-4 text-[11px] text-muted-foreground">
                    {[
                      course.mode === "live"
                        ? `${totalLessons} lessons so far · ${formatDuration(course.durationMinutes)} of video`
                        : `${totalLessons} lessons · ${formatDuration(course.durationMinutes)} of video`,
                      `${attachmentCount} downloadable resources`,
                      course.mode === "live"
                        ? "New lessons added as the course progresses"
                        : null,
                      course.certificateEnabled
                        ? course.mode === "live"
                          ? `Certificate after the course is completed (${course.examPassPercent}% pass)`
                          : `Certificate after final exam (${course.examPassPercent}% pass)`
                        : "No certificate for this course",
                      "Lifetime access on web and mobile",
                      "Doubt support by email",
                    ]
                      .filter((item): item is string => Boolean(item))
                      .map((item) => (
                      <p key={item} className="flex items-start gap-2">
                        <CheckCircleIcon
                          size={13}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            {previewLesson && (
              <div className="mb-8 rounded-xl border border-border bg-card p-4 lg:hidden">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Free preview
                </p>
                <p className="mt-2 font-heading text-sm font-semibold">
                  {previewLesson.title}
                </p>
                <div className="mt-3">
                  <CoursePreviewVideo lesson={previewLesson} />
                </div>
              </div>
            )}
            {course.outcomes.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-heading text-lg font-semibold">
                  What you&apos;ll learn
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <p
                      key={outcome}
                      className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"
                    >
                      <SealCheckIcon
                        size={15}
                        className="mt-0.5 shrink-0 text-primary"
                      />
                      {outcome}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-heading text-lg font-semibold">
                About this course
              </h2>
              <div
                className="rich-text mt-4"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>

            {course.requirements.length > 0 && (
              <div className="mt-8">
                <h2 className="font-heading text-lg font-semibold">
                  Requirements
                </h2>
                <ul className="mt-3 space-y-2">
                  {course.requirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"
                    >
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold">Curriculum</h2>
                <span className="text-[11px] text-muted-foreground">
                  {totalLessons} lessons · {formatDuration(course.durationMinutes)}
                </span>
              </div>
              <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {course.lessons.map((lessonItem, index) => (
                  <details key={lessonItem.id} className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 hover:bg-muted/40">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {lessonItem.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <PlayCircleIcon size={11} />
                          {lessonItem.durationMinutes} min
                          {lessonItem.attachments.length > 0 && (
                            <>
                              <span className="size-0.5 rounded-full bg-border" />
                              <PaperclipIcon size={10} />
                              {lessonItem.attachments.length} resources
                            </>
                          )}
                        </p>
                      </div>
                      {lessonItem.isPreview ? (
                        <Badge
                          variant="outline"
                          className="h-5 rounded-full px-2 text-[9px]"
                        >
                          Preview
                        </Badge>
                      ) : enrollment ? (
                        <Badge
                          variant="secondary"
                          className="h-5 bg-emerald-600/10 px-2 text-[9px] text-emerald-700"
                        >
                          Unlocked
                        </Badge>
                      ) : (
                        <LockKeyIcon
                          size={13}
                          className="text-muted-foreground"
                        />
                      )}
                    </summary>
                    {lessonItem.description && (
                      <div className="border-t border-border/60 bg-muted/20 px-4 py-3 pl-13 text-[11px] leading-5 text-muted-foreground">
                        {lessonItem.description}
                      </div>
                    )}
                  </details>
                ))}
                {totalLessons === 0 && (
                  <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                    Lessons are being added for this course.
                  </p>
                )}
              </div>
            </div>

            {/* Certificate / exam */}
            {course.certificateEnabled && (
              <div className="mt-10 rounded-xl border border-border bg-primary/[0.04] p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-primary">
                    <MedalIcon size={22} weight="duotone" />
                  </span>
                  <div>
                    <h2 className="font-heading text-base font-semibold">
                      Finish with an exam-verified certificate
                    </h2>
                    <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                      {course.mode === "live"
                        ? `This course is still live. Once the instructor finishes uploading every lesson, the final exam opens here. Score ${course.examPassPercent}% or above to unlock your certificate, with a ${course.examLockHours}h retry lock if you miss the mark.`
                        : `After the last lesson, take the final exam written by the course team. Score ${course.examPassPercent}% or above to unlock your certificate. If you miss the mark, you can retry after ${course.examLockHours} hours.`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <FileTextIcon size={12} /> Written by instructors
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <LockKeyIcon size={12} /> {course.examLockHours}h retry
                        lock
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <SealCheckIcon size={12} /> Verifiable certificate
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructor */}
            <div className="mt-10 rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold">
                Your instructor
              </h2>
              <div className="mt-4 flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                  {course.instructorName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold">{course.instructorName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {course.instructorRole}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    Part of the Sqrock Academy in-house team. Courses are
                    designed around real projects and the skills hiring teams
                    ask for.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            {previewLesson && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Free preview
                </p>
                <p className="mt-2 font-heading text-sm font-semibold">
                  {previewLesson.title}
                </p>
                <div className="mt-3">
                  <CoursePreviewVideo lesson={previewLesson} />
                </div>
                <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                  Enrol to unlock every lesson, attachment and the final exam.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <h2 className="font-heading text-xl font-semibold">
                More in {course.category}
              </h2>
              <Link
                href={`/courses?category=${encodeURIComponent(course.category)}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary"
              >
                View all <ArrowRightIcon size={12} />
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <CourseCard key={item.id} course={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
