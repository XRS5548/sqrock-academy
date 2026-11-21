import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/site/course-card";
import { categories } from "@/lib/demo-data";
import { getPublishedCourses } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse Sqrock Academy courses in development, data & AI, game development, cloud, business and marketing.",
};

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

function buildHref(
  current: { category?: string; level?: string; free?: string; search?: string },
  updates: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  const merged = { ...current, ...updates };
  Object.entries(merged).forEach(([key, value]) => {
    if (value && value !== "All") params.set(key, value);
  });
  const query = params.toString();
  return query ? `/courses?${query}` : "/courses";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; level?: string; free?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "All";
  const level = sp.level ?? "All";
  const free = sp.free === "1";
  const search = sp.search ?? "";

  const courses = await getPublishedCourses({
    category,
    level,
    free,
    search,
  });

  const current = { category, level, free: free ? "1" : undefined, search };

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Badge
            variant="outline"
            className="h-6 rounded-full border-border bg-background/80 px-3 text-[10px]"
          >
            <SparkleIcon size={11} className="text-primary" /> 120+ courses across
            6 career paths
          </Badge>
          <h1 className="mt-4 max-w-2xl font-heading text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Find your next skill.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Project-based courses built by working professionals. Filter by
            path, level or start with a free course.
          </p>

          <form action="/courses" className="mt-7 flex max-w-xl gap-2">
            {category !== "All" && (
              <input type="hidden" name="category" value={category} />
            )}
            <div className="relative flex-1">
              <MagnifyingGlassIcon
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search courses, e.g. Python or AWS"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>
            <Button type="submit" size="lg" className="h-10 rounded-lg px-4 text-sm">
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Filters */}
          <aside className="space-y-7">
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <FunnelSimpleIcon size={12} /> Category
              </p>
              <div className="flex flex-wrap gap-1.5 lg:flex-col lg:items-start">
                <Link
                  href={buildHref(current, { category: undefined })}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-muted",
                    category === "All"
                      ? "bg-foreground text-background hover:bg-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  All categories
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.name}
                    href={buildHref(current, { category: c.name })}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-muted",
                      category === c.name
                        ? "bg-foreground text-background hover:bg-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Level
              </p>
              <div className="flex flex-wrap gap-1.5 lg:flex-col lg:items-start">
                {levels.map((l) => (
                  <Link
                    key={l}
                    href={buildHref(current, { level: l === "All" ? undefined : l })}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-muted",
                      (sp.level ?? "All") === l
                        ? "bg-foreground text-background hover:bg-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Price
              </p>
              <Link
                href={buildHref(current, { free: free ? undefined : "1" })}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] font-medium transition-colors",
                  free
                    ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-700"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <CheckCircleIcon size={13} />
                Free courses only
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold">Not sure where to start?</p>
              <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                Try a free course first. Every paid course also has free preview
                lessons.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
              >
                Ask us <ArrowRightIcon size={11} />
              </Link>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {courses.length}
                </span>{" "}
                course{courses.length === 1 ? "" : "s"}
                {search && (
                  <>
                    {" "}
                    for <span className="font-medium text-foreground">“{search}”</span>
                  </>
                )}
              </p>
              {(category !== "All" || level !== "All" || free || search) && (
                <Link
                  href="/courses"
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Clear filters
                </Link>
              )}
            </div>

            {courses.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <MagnifyingGlassIcon size={18} />
                </span>
                <h2 className="mt-3 font-heading text-base font-semibold">
                  No courses match those filters
                </h2>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Try a different category, level or search term. New courses are
                  added every month.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="mt-4 h-9 rounded-lg text-xs"
                  render={<Link href="/courses" />}
                >
                  Reset filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
