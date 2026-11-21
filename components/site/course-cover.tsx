import {
  BrainIcon,
  ChartLineUpIcon,
  CloudIcon,
  CodeIcon,
  GameControllerIcon,
  MegaphoneIcon,
  PlayIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof CodeIcon> = {
  Development: CodeIcon,
  "Data & AI": BrainIcon,
  "Game Development": GameControllerIcon,
  "Cloud & DevOps": CloudIcon,
  Business: ChartLineUpIcon,
  Marketing: MegaphoneIcon,
};

export function CourseCover({
  title,
  category,
  slug,
  thumbnail,
  className,
  large = false,
}: {
  title: string;
  category: string;
  slug: string;
  thumbnail?: string | null;
  className?: string;
  large?: boolean;
}) {
  const Icon = iconMap[category] ?? SparkleIcon;
  const initials = title
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-muted/60",
        large ? "aspect-[16/9]" : "aspect-[16/9]",
        className,
      )}
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt={title}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="absolute -right-12 -top-12 size-56 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 size-52 rounded-full bg-foreground/5 blur-2xl" />
        </>
      )}
      {thumbnail && <div className="absolute inset-0 bg-foreground/25" />}

      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground backdrop-blur">
            <Icon size={12} weight="duotone" />
            {category}
          </span>
          <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            Sqrock
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p
              className={cn(
                "font-heading font-semibold tracking-tight text-foreground/85",
                large ? "text-2xl" : "text-xl",
              )}
            >
              {initials}
              <span className="text-primary">.</span>
            </p>
            <p className="mt-0.5 line-clamp-2 max-w-[22ch] text-[11px] font-medium leading-4 text-muted-foreground">
              {title}
            </p>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/90 text-primary shadow-sm backdrop-blur">
            <PlayIcon size={14} weight="fill" />
          </div>
        </div>
      </div>
    </div>
  );
}
