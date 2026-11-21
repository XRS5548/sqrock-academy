import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CertificateIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  PlayCircleIcon,
  SealCheckIcon,
  SparkleIcon,
  TrophyIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCover } from "@/components/site/course-cover";
import {
  getCertificates,
  getEnrolledCourses,
  getPublishedCourses,
  getStudentStats,
} from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { formatDuration } from "@/components/site/course-card";
import { CourseCard } from "@/components/site/course-card";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [enrolled, stats, certificates, recommended] = await Promise.all([
    getEnrolledCourses(user.id),
    getStudentStats(user.id),
    getCertificates(user.id),
    getPublishedCourses({ limit: 4 }),
  ]);

  const active = enrolled.filter((e) => e.enrollment.status !== "completed");
  const readyForExam = enrolled.filter(
    (e) =>
      e.totalLessons > 0 &&
      e.completedLessons >= e.totalLessons &&
      e.enrollment.status !== "completed",
  );
  const firstName = user.name.split(" ")[0];

  const statCards = [
    {
      label: "Enrolled courses",
      value: stats.enrolled,
      icon: BookOpenIcon,
      note: "Lifetime access",
    },
    {
      label: "Lessons completed",
      value: stats.lessonsDone,
      icon: CheckCircleIcon,
      note: "Keep the streak going",
    },
    {
      label: "Certificates earned",
      value: stats.certificates,
      icon: CertificateIcon,
      note: "Exam verified",
    },
    {
      label: "Courses finished",
      value: stats.completed,
      icon: TrophyIcon,
      note: "Great work",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">
            {greeting()}, {firstName}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {active.length > 0
              ? "Pick up where you left off"
              : "Ready to start something new?"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {active.length > 0
              ? `You have ${active.length} course${active.length === 1 ? "" : "s"} in progress.`
              : "Browse free and paid courses and start learning today."}
          </p>
        </div>
        <Button
          size="lg"
          className="h-9 w-fit rounded-lg px-3 text-xs"
          render={<Link href="/courses" />}
        >
          Browse courses <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, note }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <Icon size={16} weight="duotone" />
              </span>
              <span className="font-heading text-xl font-semibold">{value}</span>
            </div>
            <p className="mt-3 text-[11px] font-semibold">{label}</p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      {readyForExam.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                <SealCheckIcon size={19} weight="duotone" />
              </span>
              <div>
                <p className="text-xs font-semibold">
                  You&apos;re ready for the final exam
                </p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {readyForExam[0].course.title} · Pass to unlock your
                  certificate.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="h-9 shrink-0 rounded-lg px-3 text-xs"
              render={
                <Link
                  href={`/dashboard/courses/${readyForExam[0].course.slug}/exam`}
                />
              }
            >
              Take exam <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}

      {/* Continue learning */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">
            Continue learning
          </h2>
          <Link
            href="/dashboard/courses"
            className="text-[11px] font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {enrolled.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border bg-background px-6 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BookOpenIcon size={22} />
            </span>
            <h3 className="mt-3 font-heading text-sm font-semibold">
              You haven&apos;t enrolled in a course yet
            </h3>
            <p className="mt-1 max-w-sm text-[11px] leading-5 text-muted-foreground">
              Start with a free course like Python for Absolute Beginners and see
              how the platform works.
            </p>
            <Button
              size="lg"
              className="mt-4 h-9 rounded-lg px-4 text-xs"
              render={<Link href="/courses" />}
            >
              Find your first course
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {enrolled.slice(0, 2).map(({ course, progress, totalLessons, completedLessons }) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-xl border border-border bg-background"
              >
                <div className="flex gap-4 p-4">
                  <div className="w-28 shrink-0 overflow-hidden rounded-lg border border-border">
                    <CourseCover
                      title={course.title}
                      category={course.category}
                      slug={course.slug}
                      thumbnail={course.thumbnail}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                      {course.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 font-heading text-sm font-semibold leading-snug">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {completedLessons} of {totalLessons} lessons ·{" "}
                      {formatDuration(course.durationMinutes)}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
                      <span>{progress}% complete</span>
                      <span>{progress === 100 ? "Ready for exam" : "In progress"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5">
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ClockIcon size={12} /> Self paced
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-[10px] text-primary"
                    render={<Link href={`/dashboard/courses/${course.slug}`} />}
                  >
                    <PlayCircleIcon size={13} weight="fill" />
                    {progress === 0 ? "Start" : "Continue"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Certificates */}
        <section className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              Your certificates
            </h2>
            <Link
              href="/dashboard/certificates"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {certificates.length === 0 ? (
            <div className="mt-4 flex flex-col items-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <CertificateIcon size={22} className="text-muted-foreground" />
              <p className="mt-2 text-[11px] font-medium">
                No certificates yet
              </p>
              <p className="mt-1 max-w-xs text-[10px] leading-4 text-muted-foreground">
                Complete a course and pass the final exam to unlock your first
                certificate.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {certificates.slice(0, 3).map(({ certificate, course }) => (
                <Link
                  key={certificate.id}
                  href={`/certificates/${certificate.certificateNo}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
                    <CertificateIcon size={16} weight="duotone" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold">
                      {course.title}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      Score {certificate.score}% ·{" "}
                      {new Date(certificate.issuedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <ArrowRightIcon size={13} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Jobs */}
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="font-heading text-base font-semibold">Career board</h2>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            New jobs and internships are added every day.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Engineering", "Data", "Cloud", "Marketing"].map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="h-5 rounded-full px-2 text-[9px]"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Button
            variant="outline"
            size="lg"
            className="mt-5 h-9 w-full rounded-lg text-xs"
            render={<Link href="/dashboard/jobs" />}
          >
            Browse latest openings <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/40 p-3">
            <FireIcon size={14} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-[10px] leading-4 text-muted-foreground">
              Tip: finish a course and add the certificate to your resume before
              applying.
            </p>
          </div>
        </section>
      </div>

      {/* Recommended */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-heading text-base font-semibold">
            <SparkleIcon size={15} className="text-primary" />
            Recommended for you
          </h2>
          <Link
            href="/courses"
            className="text-[11px] font-medium text-primary hover:underline"
          >
            See all
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommended
            .filter(
              (course) => !enrolled.some((e) => e.course.id === course.id),
            )
            .slice(0, 4)
            .map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
        </div>
      </section>
    </div>
  );
}
