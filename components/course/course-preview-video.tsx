import { PlayCircleIcon } from "@phosphor-icons/react/ssr";
import { normalizeVideoUrl } from "@/lib/video";

export function CoursePreviewVideo({
  lesson,
}: {
  lesson: { title: string; videoUrl: string; videoType: string };
}) {
  const video = normalizeVideoUrl(lesson.videoUrl, lesson.videoType);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-foreground/95">
      {video ? (
        video.kind === "youtube" ? (
          <iframe
            src={video.src}
            title={lesson.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={video.src} controls className="h-full w-full" />
        )
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-background/60">
          <PlayCircleIcon size={22} />
          <p className="px-3 text-center text-[10px]">
            Preview video coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
