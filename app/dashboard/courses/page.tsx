import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CertificateIcon,
  ClockIcon,
  PlayCircleIcon,
  SealCheckIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCover } from "@/components/site/course-cover";
import { formatDuration } from "@/components/site/course-card";
import { getEnrolledCourses } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser("/dashboard/courses");
  const sp = await searchParams;
  const status = sp.status ?? "all";
  const enrolled = await getEnrolledCourses(user.id);

  const filtered = enrolled.filter((item) => {
    if (status === "completed") return item.enrollment.status === "completed";
    if (status === "in-progress") return item.enrollment.status !== "completed";
    return true;
  });

  const tabs = [
    { label: "All courses", value: "all" },
    { label: "In progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            My courses
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Every course you&apos;ve enrolled in, with progress and certificates.
          </p>
        </div>
        <Button
          size="lg"
          className="h-9 w-fit rounded-lg px-3 text-xs"
          render={<Link href="/courses" />}
        >
          Find a new course <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border pb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/dashboard/courses" : `/dashboard/courses?status=${tab.value}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
              status === tab.value
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-background px-6 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BookOpenIcon size={22} />
          </span>
          <h2 className="mt-3 font-heading text-sm font-semibold">
            {enrolled.length === 0
              ? "No courses yet"
              : "Nothing in this filter"}
          </h2>
          <p className="mt-1 max-w-sm text-[11px] leading-5 text-muted-foreground">
            {enrolled.length === 0
              ? "Enrol in a free course to get started, or browse paid courses with preview lessons."
              : "Switch to another tab to see your other courses."}
          </p>
          <Button
            size="lg"
            className="mt-4 h-9 rounded-lg px-4 text-xs"
            render={<Link href="/courses" />}
          >
            Browse courses
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(
            ({ course, progress, totalLessons, completedLessons, enrollment }) => {
              const completed = enrollment.status === "completed";
              return (
                <div
                  key={course.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center"
                >
                  <div className="w-full shrink-0 overflow-hidden rounded-lg border border-border sm:w-40">
                    <CourseCover
                      title={course.title}
                      category={course.category}
                      slug={course.slug}
                      thumbnail={course.thumbnail}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                        {course.category}
                      </p>
                      {completed ? (
                        <Badge className="h-4 bg-emerald-600/10 px-1.5 text-[8px] text-emerald-700">
                          Completed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="h-4 px-1.5 text-[8px]"
                        >
                          In progress
                        </Badge>
                      )}
                    </div>
                    <h2 className="mt-1 font-heading text-sm font-semibold">
                      {course.title}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <PlayCircleIcon size={11} />
                        {completedLessons}/{totalLessons} lessons
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon size={11} />
                        {formatDuration(course.durationMinutes)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircleIcon size={11} />
                        {progress}% done
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 max-w-md overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      size="lg"
                      className="h-9 rounded-lg px-3 text-xs"
                      render={<Link href={`/dashboard/courses/${course.slug}`} />}
                    >
                      {completed ? "Review" : progress === 0 ? "Start" : "Continue"}
                      <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                    {progress === 100 && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-9 rounded-lg px-3 text-xs"
                        render={
                          <Link
                            href={`/dashboard/courses/${course.slug}/exam`}
                          />
                        }
                      >
                        <SealCheckIcon data-icon="inline-start" />
                        Exam
                      </Button>
                    )}
                    {completed && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-9 rounded-lg px-3 text-xs"
                        render={<Link href="/dashboard/certificates" />}
                      >
                        <CertificateIcon data-icon="inline-start" />
                        Certificate
                      </Button>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
