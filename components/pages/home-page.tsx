import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BrainIcon,
  BriefcaseIcon,
  CertificateIcon,
  ChartLineUpIcon,
  ChatCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudIcon,
  CodeIcon,
  DeviceMobileIcon,
  EnvelopeSimpleIcon,
  GameControllerIcon,
  MedalIcon,
  MegaphoneIcon,
  QuotesIcon,
  ShieldCheckIcon,
  SparkleIcon,
  StarIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseCard, formatDuration } from "@/components/site/course-card";
import { CourseCover } from "@/components/site/course-cover";
import { JobCard } from "@/components/site/job-card";
import { SectionHeading } from "@/components/site/section-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getApprovedJobs, getPublishedCourses } from "@/lib/queries";
import { faqs, features, site, stats, testimonials } from "@/lib/demo-data";

const featureIcons = {
  Medal: MedalIcon,
  Clock: ClockIcon,
  Certificate: CertificateIcon,
  Briefcase: BriefcaseIcon,
  ChatCircle: ChatCircleIcon,
  DeviceMobile: DeviceMobileIcon,
} as const;

const categoryIcons = {
  Development: CodeIcon,
  "Data & AI": BrainIcon,
  "Game Development": GameControllerIcon,
  "Cloud & DevOps": CloudIcon,
  Business: ChartLineUpIcon,
  Marketing: MegaphoneIcon,
} as const;

export async function HomePage() {
  const [courses, jobs] = await Promise.all([
    getPublishedCourses({ limit: 8 }),
    getApprovedJobs(),
  ]);
  const featured = courses.slice(0, 4);
  const heroCourse = courses[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -left-40 top-0 size-[28rem] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-[26rem] rounded-full bg-foreground/[0.04] blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 py-1 pl-1 pr-3 text-[11px] font-medium text-muted-foreground backdrop-blur">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                <SparkleIcon size={11} weight="fill" /> New
              </span>
              Mobile app launches {site.appLaunch}
            </div>

            <h1 className="mt-6 max-w-2xl font-heading text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.05rem]">
              Learn skills.
              <br />
              Build proof.
              <br />
              <span className="relative inline-block">
                Get hired.
                <span className="absolute inset-x-0 -bottom-1 h-2 -skew-x-6 rounded-sm bg-primary/15" />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-base">
              Industry-focused courses in development, data, AI, game
              development, cloud and business — taught by working
              professionals, with certificates and a jobs board built in.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-11 rounded-lg px-5 text-sm"
                render={<Link href="/courses" />}
              >
                Explore courses
                <ArrowRightIcon data-icon="inline-end" weight="bold" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-lg px-5 text-sm"
                render={<Link href="/jobs" />}
              >
                Find jobs & internships
                <ArrowUpRightIcon data-icon="inline-end" weight="bold" />
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["AS", "MR", "FK", "KV"].map((initials, i) => (
                    <span
                      key={initials}
                      className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-semibold text-foreground"
                      style={{ zIndex: 4 - i }}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} size={12} weight="fill" />
                    ))}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    24,000+ learners building their careers
                  </p>
                </div>
              </div>
              <div className="hidden h-9 w-px bg-border sm:block" />
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheckIcon size={18} className="text-primary" />
                Exam-verified certificates
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-3 rotate-2 rounded-[26px] border border-border bg-muted/50" />
            <div className="relative rounded-2xl border border-border bg-card p-4 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary/70" />
                  <span className="size-2 rounded-full bg-muted-foreground/25" />
                  <span className="size-2 rounded-full bg-muted-foreground/25" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Continue learning
                </span>
              </div>
              {heroCourse && (
                <>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <CourseCover
                      title={heroCourse.title}
                      category={heroCourse.category}
                      slug={heroCourse.slug}
                      thumbnail={heroCourse.thumbnail}
                    />
                  </div>
                  <div className="px-1 pt-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{heroCourse.category}</span>
                      <span>{formatDuration(heroCourse.durationMinutes)}</span>
                    </div>
                    <h3 className="mt-1 font-heading text-lg font-semibold leading-snug tracking-tight">
                      {heroCourse.title}
                    </h3>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-medium">
                      <span className="text-muted-foreground">
                        3 of 8 lessons complete
                      </span>
                      <span className="text-primary">38%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[38%] rounded-full bg-primary" />
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                      <span className="inline-flex items-center gap-2 text-[11px] font-medium">
                        <CheckCircleIcon
                          size={16}
                          weight="fill"
                          className="text-emerald-600"
                        />
                        Lesson 3 · Conditionals
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Resume
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Floating certificate */}
            <div className="absolute -bottom-8 -left-3 hidden w-52 rotate-[-3deg] rounded-xl border border-border bg-card p-3 shadow-lg sm:block">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CertificateIcon size={16} weight="duotone" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold">Certificate unlocked</p>
                  <p className="text-[9px] text-muted-foreground">
                    Python for Beginners
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-[9px] text-muted-foreground">
                <span>Score 86%</span>
                <span className="font-medium text-emerald-700">Verified</span>
              </div>
            </div>

            {/* Floating exam */}
            <div className="absolute -right-2 top-24 hidden w-44 rotate-[3deg] rounded-xl border border-border bg-card p-3 shadow-lg md:block">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
                  <ShieldCheckIcon size={14} weight="duotone" />
                </span>
                <p className="text-[10px] font-semibold">Final exam</p>
              </div>
              <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                Pass with 70% to unlock your certificate.
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[70%] rounded-full bg-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-border bg-background/60 backdrop-blur">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 divide-border px-4 sm:px-6 lg:grid-cols-4 lg:divide-x lg:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="px-2 py-5 lg:px-8 lg:py-6">
                <p className="font-heading text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse by path"
          title="Pick the direction you want your career to take"
          description="From your first line of code to cloud deployments and business strategy — start where it makes sense for you."
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(categoryIcons).map(([name, Icon]) => {
            const count = courses.filter((c) => c.category === name).length;
            return (
              <Link
                key={name}
                href={`/courses?category=${encodeURIComponent(name)}`}
                className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-sm"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <Icon size={18} weight="duotone" />
                </span>
                <div>
                  <p className="text-xs font-semibold leading-tight">{name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {count} course{count === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured courses */}
      {featured.length > 0 && (
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Most popular"
            title="Courses learners are finishing right now"
            description="Hands-on, project-based and built around what hiring teams actually ask for."
            action={
              <Button
                variant="outline"
                size="lg"
                className="h-10 rounded-lg px-4 text-sm"
                render={<Link href="/courses" />}
              >
                View all courses
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            }
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleIcon size={14} className="text-emerald-600" /> Lifetime
              access
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleIcon size={14} className="text-emerald-600" /> Downloadable
              resources
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleIcon size={14} className="text-emerald-600" /> Exam-verified
              certificate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleIcon size={14} className="text-emerald-600" /> Doubt support
              by email
            </span>
          </div>
        </div>
      </section>
      )}

      {/* Why */}
      <section id="why" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading
          align="center"
          eyebrow="Why Sqrock Academy"
          title="A learning platform built like a product team"
          description="No fluff, no recycled content. Courses are written and recorded in-house, then tested by the people who hire."
        />
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = featureIcons[feature.icon as keyof typeof featureIcons];
            return (
              <div
                key={feature.title}
                className="flex flex-col gap-3 border-t border-border pt-6"
              >
                <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/50 text-primary">
                  <Icon size={18} weight="duotone" />
                </span>
                <h3 className="font-heading text-sm font-semibold">
                  {feature.title}
                </h3>
                <p className="text-xs leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works + certificate */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <SectionHeading
              eyebrow="How it works"
              title="From enrolling to certified, in four steps"
            />
            <div className="mt-8 space-y-1">
              {[
                {
                  title: "Enrol in a course",
                  body: "Free courses unlock instantly. Paid courses unlock all lessons, attachments and the final exam.",
                },
                {
                  title: "Learn at your pace",
                  body: "Watch lessons, follow along with projects and download every resource attached to each lesson.",
                },
                {
                  title: "Take the final exam",
                  body: "A short exam written by the course team. Pass with the minimum marks to unlock your certificate.",
                },
                {
                  title: "Unlock your certificate",
                  body: "Get a verifiable certificate with your score. If you do not pass, you can retry after 48 hours.",
                },
              ].map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-lg p-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background font-heading text-[11px] font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rotate-[-2deg] rounded-3xl border border-border bg-background" />
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.4)]">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <CertificateIcon size={17} weight="duotone" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Certificate of completion
                    </p>
                    <p className="text-xs font-semibold">Sqrock Academy</p>
                  </div>
                </div>
                <Badge className="h-5 bg-emerald-600/10 text-[9px] text-emerald-700">
                  Verified
                </Badge>
              </div>
              <div className="py-8 text-center">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  This certifies that
                </p>
                <p className="mt-2 font-heading text-xl font-semibold tracking-tight">
                  Ananya Sharma
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  has successfully completed
                </p>
                <p className="mt-2 font-heading text-base font-semibold">
                  Python for Absolute Beginners
                </p>
                <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Final score
                    </p>
                    <p className="text-sm font-semibold text-emerald-700">86%</p>
                  </div>
                  <div className="h-7 w-px bg-border" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Certificate ID
                    </p>
                    <p className="font-mono text-[10px]">SQ-2026-01482</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="font-heading text-[10px] font-semibold">
                    Aarav Mehta
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    Lead Instructor
                  </p>
                </div>
                <div className="text-right text-[9px] text-muted-foreground">
                  <p>Issued 18 Nov 2026</p>
                  <p>Verify at sqrock.cloud</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Jobs & internships"
          title="Fresh openings, checked by our team every day"
          description="Apply directly. No middlemen. Verified companies can also post roles for free after admin approval."
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="lg"
                className="h-10 rounded-lg px-4 text-sm"
                render={<Link href="/jobs/post" />}
              >
                Post a job
              </Button>
              <Button
                size="lg"
                className="h-10 rounded-lg px-4 text-sm"
                render={<Link href="/jobs" />}
              >
                Browse all
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          }
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Mobile app */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-primary/[0.06] px-6 py-12 text-foreground sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-grid opacity-[0.06]" />
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <Badge className="h-6 border border-primary/20 bg-background px-3 text-[10px] text-primary">
                <DeviceMobileIcon size={12} /> Launching {site.appLaunch}
              </Badge>
              <h2 className="mt-4 max-w-xl font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Your courses, in your pocket.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                The Sqrock Academy app brings the same lessons, progress
                tracking, exam attempts and certificates to mobile. Finish a
                lesson on your commute, continue on your laptop.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-lg border border-border bg-background px-4 py-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    Coming to
                  </p>
                  <p className="text-xs font-semibold">Android & iOS</p>
                </div>
                <div className="rounded-lg border border-border bg-background px-4 py-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    Launch date
                  </p>
                  <p className="text-xs font-semibold">{site.appLaunch}</p>
                </div>
              </div>
            </div>
            <div className="relative mx-auto w-48">
              <div className="rounded-[2rem] border border-border bg-background p-2 shadow-2xl">
                <div className="overflow-hidden rounded-[1.5rem] bg-muted">
                  <div className="bg-muted px-4 py-3 text-center text-[8px] text-muted-foreground">
                    sqrock academy
                  </div>
                  <div className="space-y-2 p-2">
                    <div className="rounded-lg bg-card p-2">
                      <div className="h-14 rounded bg-primary/10" />
                      <div className="mt-1.5 h-1.5 w-3/4 rounded bg-foreground/20" />
                      <div className="mt-1 h-1 w-1/2 rounded bg-foreground/10" />
                    </div>
                    <div className="rounded-lg bg-card p-2">
                      <div className="h-14 rounded bg-muted" />
                      <div className="mt-1.5 h-1.5 w-2/3 rounded bg-foreground/20" />
                      <div className="mt-1 h-1 w-1/2 rounded bg-foreground/10" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-card px-2 py-2 text-[7px] text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-semibold text-primary">38%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            align="center"
            eyebrow="Learner stories"
            title="Finished courses, new jobs, real confidence"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-xl border border-border bg-card p-6"
              >
                <QuotesIcon size={22} weight="fill" className="text-primary/30" />
                <blockquote className="mt-3 flex-1 text-xs leading-6 text-muted-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex size-8 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              FAQ
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-[2rem]">
              Questions, answered.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Still unsure about something? Email us at{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {site.email}
              </a>{" "}
              and the team will get back to you.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-[11px] text-muted-foreground">
              <ChatCircleIcon size={16} className="text-primary" />
              Replies from the same team that builds the courses.
            </div>
          </div>
          <Accordion className="rounded-xl border-border bg-card">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.q} value={`faq-${index}`}>
                <AccordionTrigger className="p-4 text-[13px]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-xs leading-6 text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-primary/[0.06] px-6 py-14 text-center sm:px-10">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-background text-primary">
              <MedalIcon size={22} weight="duotone" />
            </span>
            <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with one course. Finish with proof.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              Create your free account, enrol in a course and start learning in
              the next five minutes.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-11 rounded-lg px-6 text-sm"
                render={<Link href="/signup" />}
              >
                Create free account
                <ArrowRightIcon data-icon="inline-end" weight="bold" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 rounded-lg px-5 text-sm"
                render={<Link href="/courses" />}
              >
                Browse courses
              </Button>
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <EnvelopeSimpleIcon size={13} />
              Need help? {site.email}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
