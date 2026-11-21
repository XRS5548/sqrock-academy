import Link from "next/link";
import { ClockIcon, StarIcon, UsersIcon } from "@phosphor-icons/react/ssr";
import { CourseCover } from "@/components/site/course-cover";
import { Badge } from "@/components/ui/badge";
import type { CourseView } from "@/lib/types";
import { cn } from "@/lib/utils";

export function formatPrice(course: Pick<CourseView, "isFree" | "price">) {
  if (course.isFree || course.price === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(course.price);
}

export function formatDuration(minutes: number) {
  if (!minutes) return "Self paced";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function CourseCard({
  course,
  className,
}: {
  course: CourseView;
  className?: string;
}) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]",
        className,
      )}
    >
      <div className="relative">
        <CourseCover
          title={course.title}
          category={course.category}
          slug={course.slug}
          thumbnail={course.thumbnail}
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {course.mode === "live" && (
            <Badge className="h-5 rounded-full bg-amber-500 px-2 text-[10px] text-white">
              Live
            </Badge>
          )}
          {(course.isFree || course.price === 0) && (
            <Badge className="h-5 rounded-full bg-emerald-600 px-2 text-[10px] text-white">
              Free
            </Badge>
          )}
          {course.level === "Beginner" && !course.isFree && (
            <Badge
              variant="outline"
              className="h-5 rounded-full border-border bg-background/90 px-2 text-[10px] backdrop-blur"
            >
              Beginner friendly
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{course.category}</span>
          <span className="size-1 rounded-full bg-border" />
          <span>{course.level}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-heading text-[15px] font-semibold leading-snug tracking-tight group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {course.subtitle}
        </p>

        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClockIcon size={12} />
            {formatDuration(course.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <UsersIcon size={12} />
            {(course.enrollments / 1000).toFixed(1)}k
          </span>
          <span className="inline-flex items-center gap-1">
            <StarIcon size={12} weight="fill" className="text-amber-500" />
            {(course.rating / 10).toFixed(1)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
              {course.instructorName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {course.instructorName}
            </span>
          </div>
          <span
            className={cn(
              "font-heading text-sm font-semibold",
              course.isFree || course.price === 0
                ? "text-emerald-700"
                : "text-foreground",
            )}
          >
            {formatPrice(course)}
          </span>
        </div>
      </div>
    </Link>
  );
}
