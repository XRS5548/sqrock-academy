"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CaretDownIcon,
  CaretUpIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  FloppyDiskIcon,
  ImageIcon,
  PlusIcon,
  TrashIcon,
  VideoCameraIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { FileUpload } from "@/components/admin/file-upload";
import { saveCourse, saveExamQuestions, type CourseInput, type LessonInput } from "@/lib/actions";
import {
  validateCourse,
  slugify,
  type QuestionInput,
} from "@/lib/course-validation";
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-start gap-1 text-[10px] font-medium text-destructive">
      <WarningCircleIcon size={12} className="mt-0.5 shrink-0" />
      {message}
    </p>
  );
}

function RequiredMark() {
  return <span className="text-destructive"> *</span>;
}

const categories = [
  "Development",
  "Data & AI",
  "Game Development",
  "Cloud & DevOps",
  "Business",
  "Marketing",
  "Design",
  "Other",
];

const emptyLesson = (): LessonInput => ({
  title: "",
  description: "",
  videoType: "youtube",
  videoUrl: "",
  videoKey: null,
  durationMinutes: 0,
  isPreview: false,
  attachments: [],
});

const fieldClass = "mt-1.5 h-9 rounded-lg bg-background text-xs";
const selectClass =
  "mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export function CourseEditor({
  courseId,
  initial,
  initialQuestions = [],
}: {
  courseId?: string;
  initial?: Partial<CourseInput>;
  initialQuestions?: QuestionInput[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [questions, setQuestions] = useState<QuestionInput[]>(initialQuestions);

  const [form, setForm] = useState<CourseInput>({
    id: courseId,
    title: "",
    subtitle: "",
    slug: "",
    description: "",
    category: "Development",
    level: "Beginner",
    language: "English",
    price: 0,
    isFree: false,
    status: "draft",
    durationMinutes: 0,
    instructorName: "Sqrock Academy",
    instructorRole: "Instructor",
    thumbnail: null,
    trailerUrl: null,
    outcomes: [],
    requirements: [],
    tags: [],
    certificateEnabled: true,
    examPassPercent: 70,
    examLockHours: 48,
    lessons: [],
    ...initial,
  });

  const totalLessonMinutes = useMemo(
    () =>
      form.lessons.reduce(
        (sum, lesson) => sum + (Number(lesson.durationMinutes) || 0),
        0,
      ),
    [form.lessons],
  );

  const validation = useMemo(
    () => validateCourse(form, questions),
    [form, questions],
  );

  const checklist = [
    {
      label: "Course details",
      ok: !(
        validation.course.title ||
        validation.course.slug ||
        validation.course.subtitle ||
        validation.course.description
      ),
    },
    {
      label: "Category, level & language",
      ok: !(
        validation.course.category ||
        validation.course.level ||
        validation.course.language
      ),
    },
    {
      label: "Instructor",
      ok: !validation.course.instructorName,
    },
    { label: "Price", ok: !validation.course.price },
    {
      label: "Lessons with duration & video",
      ok:
        !validation.course.lessons &&
        !validation.course.durationMinutes &&
        Object.keys(validation.lessons).length === 0,
    },
    {
      label: "Exam questions",
      ok:
        !validation.course.exam &&
        !validation.course.examPassPercent &&
        !validation.course.examLockHours &&
        Object.keys(validation.questions).length === 0,
    },
  ];

  useEffect(() => {
    if (saved) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saved]);

  function setField<K extends keyof CourseInput>(key: K, value: CourseInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updateLesson(index: number, patch: Partial<LessonInput>) {
    setForm((prev) => {
      const lessons = [...prev.lessons];
      lessons[index] = { ...lessons[index], ...patch };
      return { ...prev, lessons };
    });
    setSaved(false);
  }

  function addLesson() {
    setForm((prev) => ({ ...prev, lessons: [...prev.lessons, emptyLesson()] }));
    setSaved(false);
  }

  function removeLesson(index: number) {
    setForm((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index),
    }));
    setSaved(false);
  }

  function moveLesson(index: number, direction: -1 | 1) {
    setForm((prev) => {
      const lessons = [...prev.lessons];
      const target = index + direction;
      if (target < 0 || target >= lessons.length) return prev;
      [lessons[index], lessons[target]] = [lessons[target], lessons[index]];
      return { ...prev, lessons };
    });
    setSaved(false);
  }

  function submit() {
    setShowErrors(true);
    if (!validation.ok) {
      toast.error(
        validation.messages[0] ?? "Please fix the highlighted fields.",
      );
      document
        .getElementById("course-form-errors")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    startTransition(async () => {
      const payload: CourseInput = {
        ...form,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        slug: form.slug ? slugify(form.slug) : slugify(form.title),
        durationMinutes: totalLessonMinutes || Number(form.durationMinutes) || 0,
      };
      const result = await saveCourse(payload);
      if (!result.ok) {
        toast.error(result.error ?? "Could not save course.");
        return;
      }
      if (result.id && (form.certificateEnabled || questions.length > 0)) {
        const examResult = await saveExamQuestions(result.id, questions);
        if (!examResult.ok) {
          toast.error(
            examResult.error ?? "Course saved, but exam questions failed.",
          );
          setSaved(false);
          if (!courseId) {
            router.push(`/admin/courses/${result.id}/edit`);
          }
          router.refresh();
          return;
        }
      }
      toast.success("Course saved.");
      setSaved(true);
      setShowErrors(false);
      if (!courseId && result.id) {
        router.push(`/admin/courses/${result.id}/edit`);
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-14 z-20 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-sm backdrop-blur lg:top-0">
        <div>
          <Link
            href="/admin/courses"
            onClick={(event) => {
              if (
                !saved &&
                !window.confirm(
                  "You have unsaved changes. Leave this page anyway?",
                )
              ) {
                event.preventDefault();
              }
            }}
            className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon size={11} /> All courses
          </Link>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            {courseId ? "Edit course" : "Create a new course"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  saved ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
              {saved ? "All changes saved" : "Unsaved changes"}
            </span>
            <span>·</span>
            <span>
              {form.lessons.length} lesson
              {form.lessons.length === 1 ? "" : "s"} · {totalLessonMinutes} min
            </span>
            {!validation.ok && (
              <span className="font-medium text-destructive">
                · {validation.messages.length} issue
                {validation.messages.length === 1 ? "" : "s"} to fix
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={form.status}
            onChange={(event) =>
              setField("status", event.target.value as CourseInput["status"])
            }
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <Button
            size="lg"
            className="h-9 rounded-lg px-4 text-xs"
            onClick={submit}
            disabled={pending}
          >
            {pending ? "Saving…" : "Save course"}
            <FloppyDiskIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>

      {showErrors && !validation.ok && (
        <div
          id="course-form-errors"
          className="scroll-mt-24 rounded-xl border border-destructive/30 bg-destructive/[0.04] p-4"
        >
          <p className="flex items-center gap-2 text-[11px] font-semibold text-destructive">
            <WarningCircleIcon size={15} />
            Please fix {validation.messages.length} issue
            {validation.messages.length === 1 ? "" : "s"} before saving
          </p>
          <ul className="mt-2 space-y-1 pl-5 text-[10px] leading-5 text-destructive">
            {validation.messages.slice(0, 6).map((message) => (
              <li key={message} className="list-disc">
                {message}
              </li>
            ))}
          </ul>
          {validation.messages.length > 6 && (
            <p className="mt-1 pl-5 text-[10px] text-destructive">
              …and {validation.messages.length - 6} more.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* Basics */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="font-heading text-sm font-semibold">Course basics</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs">
                  Title <RequiredMark />
                </Label>
                <Input
                  value={form.title}
                  aria-invalid={Boolean(showErrors && validation.course.title)}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title,
                      slug:
                        prev.slug && prev.slug !== slugify(prev.title)
                          ? prev.slug
                          : slugify(title),
                    }));
                    setSaved(false);
                  }}
                  placeholder="e.g. Python for Absolute Beginners"
                  className={cn(
                    fieldClass,
                    showErrors &&
                      validation.course.title &&
                      "border-destructive",
                  )}
                />
                <FieldError
                  message={showErrors ? validation.course.title : undefined}
                />
              </div>
              <div>
                <Label className="text-xs">
                  Slug <RequiredMark />
                </Label>
                <Input
                  value={form.slug}
                  aria-invalid={Boolean(showErrors && validation.course.slug)}
                  onChange={(event) => setField("slug", event.target.value)}
                  placeholder="python-for-absolute-beginners"
                  className={cn(
                    fieldClass,
                    showErrors &&
                      validation.course.slug &&
                      "border-destructive",
                  )}
                />
                <p className="mt-1 text-[9px] text-muted-foreground">
                  Auto-generated from the title. Used in the course URL.
                </p>
                <FieldError
                  message={showErrors ? validation.course.slug : undefined}
                />
              </div>
              <div>
                <Label className="text-xs">
                  Category <RequiredMark />
                </Label>
                <select
                  value={form.category}
                  onChange={(event) => setField("category", event.target.value)}
                  className={cn(
                    selectClass,
                    showErrors &&
                      validation.course.category &&
                      "border-destructive",
                  )}
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <FieldError
                  message={showErrors ? validation.course.category : undefined}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">
                  Short subtitle <RequiredMark />
                </Label>
                <Input
                  value={form.subtitle}
                  aria-invalid={Boolean(showErrors && validation.course.subtitle)}
                  onChange={(event) => setField("subtitle", event.target.value)}
                  placeholder="One clear sentence about the outcome"
                  className={cn(
                    fieldClass,
                    showErrors &&
                      validation.course.subtitle &&
                      "border-destructive",
                  )}
                />
                <FieldError
                  message={showErrors ? validation.course.subtitle : undefined}
                />
              </div>
              <div>
                <Label className="text-xs">
                  Level <RequiredMark />
                </Label>
                <select
                  value={form.level}
                  onChange={(event) => setField("level", event.target.value)}
                  className={cn(
                    selectClass,
                    showErrors &&
                      validation.course.level &&
                      "border-destructive",
                  )}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <FieldError
                  message={showErrors ? validation.course.level : undefined}
                />
              </div>
              <div>
                <Label className="text-xs">
                  Language <RequiredMark />
                </Label>
                <Input
                  value={form.language}
                  aria-invalid={Boolean(showErrors && validation.course.language)}
                  onChange={(event) => setField("language", event.target.value)}
                  className={cn(
                    fieldClass,
                    showErrors &&
                      validation.course.language &&
                      "border-destructive",
                  )}
                />
                <FieldError
                  message={showErrors ? validation.course.language : undefined}
                />
              </div>
              <div>
                <Label className="text-xs">
                  Instructor name <RequiredMark />
                </Label>
                <Input
                  value={form.instructorName}
                  aria-invalid={Boolean(
                    showErrors && validation.course.instructorName,
                  )}
                  onChange={(event) =>
                    setField("instructorName", event.target.value)
                  }
                  className={cn(
                    fieldClass,
                    showErrors &&
                      validation.course.instructorName &&
                      "border-destructive",
                  )}
                />
                <FieldError
                  message={
                    showErrors ? validation.course.instructorName : undefined
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Instructor role</Label>
                <Input
                  value={form.instructorRole}
                  onChange={(event) =>
                    setField("instructorRole", event.target.value)
                  }
                  className={fieldClass}
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                    <ClockIcon size={14} className="text-muted-foreground" />
                    Course duration <RequiredMark />
                  </span>
                  <span className="text-[11px] font-semibold">
                    {totalLessonMinutes} min
                    <span className="ml-1 font-normal text-muted-foreground">
                      (auto-calculated from {" "}
                      {form.lessons.length} lesson
                      {form.lessons.length === 1 ? "" : "s"})
                    </span>
                  </span>
                </div>
                <FieldError
                  message={
                    showErrors ? validation.course.durationMinutes : undefined
                  }
                />
              </div>
            </div>

            <div className="mt-5">
              <Label className="text-xs">
                Description <RequiredMark />
              </Label>
              <div
                className={cn(
                  "mt-1.5 rounded-lg",
                  showErrors &&
                    validation.course.description &&
                    "ring-1 ring-destructive",
                )}
              >
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setField("description", html)}
                  placeholder="What will students learn? Add headings, lists and links."
                  minHeight="13rem"
                />
              </div>
              <FieldError
                message={
                  showErrors ? validation.course.description : undefined
                }
              />
            </div>
          </section>

          {/* Lessons */}
          <section className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-sm font-semibold">Lessons</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Each lesson needs a title, duration and video URL. Add YouTube
                  unlisted links or upload videos to R2.
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="h-8 rounded-lg px-2.5 text-[11px]"
                onClick={addLesson}
              >
                <PlusIcon data-icon="inline-start" /> Add lesson
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {form.lessons.map((lesson, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border bg-muted/15",
                    showErrors && validation.lessons[index]
                      ? "border-destructive/40"
                      : "border-border",
                  )}
                >
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-[9px] font-semibold">
                      {index + 1}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-[11px] font-medium">
                      {lesson.title || "Untitled lesson"}
                    </p>
                    {lesson.isPreview && (
                      <Badge variant="outline" className="h-4 px-1.5 text-[8px]">
                        Preview
                      </Badge>
                    )}
                    {showErrors && validation.lessons[index] && (
                      <Badge className="h-4 bg-destructive/10 px-1.5 text-[8px] text-destructive">
                        Needs fixes
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => moveLesson(index, -1)}
                      className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      title="Move up"
                    >
                      <CaretUpIcon size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLesson(index, 1)}
                      className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      title="Move down"
                    >
                      <CaretDownIcon size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                      title="Remove"
                    >
                      <TrashIcon size={12} />
                    </button>
                  </div>

                  <div className="grid gap-3 p-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label className="text-[10px]">
                        Lesson title <RequiredMark />
                      </Label>
                      <Input
                        value={lesson.title}
                        aria-invalid={Boolean(
                          showErrors && validation.lessons[index]?.title,
                        )}
                        onChange={(event) =>
                          updateLesson(index, { title: event.target.value })
                        }
                        placeholder="Lesson title"
                        className={cn(
                          "mt-1 h-8 rounded-lg bg-background text-xs",
                          showErrors &&
                            validation.lessons[index]?.title &&
                            "border-destructive",
                        )}
                      />
                      <FieldError
                        message={
                          showErrors
                            ? validation.lessons[index]?.title
                            : undefined
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-[10px]">Video source</Label>
                      <select
                        value={lesson.videoType}
                        onChange={(event) => {
                          const videoType = event.target.value as "youtube" | "r2";
                          updateLesson(index, {
                            videoType,
                            videoUrl: "",
                            videoKey: null,
                          });
                        }}
                        className="mt-1 h-8 w-full rounded-lg border border-input bg-background px-2 text-xs"
                      >
                        <option value="youtube">YouTube (unlisted)</option>
                        <option value="r2">Uploaded video (R2)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-[10px]">
                        Duration (minutes) <RequiredMark />
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={lesson.durationMinutes || ""}
                        aria-invalid={Boolean(
                          showErrors && validation.lessons[index]?.durationMinutes,
                        )}
                        onChange={(event) =>
                          updateLesson(index, {
                            durationMinutes: Number(event.target.value),
                          })
                        }
                        placeholder="e.g. 12"
                        className={cn(
                          "mt-1 h-8 rounded-lg bg-background text-xs",
                          showErrors &&
                            validation.lessons[index]?.durationMinutes &&
                            "border-destructive",
                        )}
                      />
                      <FieldError
                        message={
                          showErrors
                            ? validation.lessons[index]?.durationMinutes
                            : undefined
                        }
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-[10px]">
                        {lesson.videoType === "youtube"
                          ? "YouTube URL or video ID"
                          : "Video URL (R2 or external)"}{" "}
                        <RequiredMark />
                      </Label>
                      <div className="mt-1 flex gap-2">
                        <Input
                          value={lesson.videoUrl}
                          aria-invalid={Boolean(
                            showErrors && validation.lessons[index]?.videoUrl,
                          )}
                          onChange={(event) =>
                            updateLesson(index, { videoUrl: event.target.value })
                          }
                          placeholder={
                            lesson.videoType === "youtube"
                              ? "https://youtube.com/watch?v=…"
                              : "https://…"
                          }
                          className={cn(
                            "h-8 flex-1 rounded-lg bg-background text-xs",
                            showErrors &&
                              validation.lessons[index]?.videoUrl &&
                              "border-destructive",
                          )}
                        />
                        {lesson.videoType === "r2" && (
                          <FileUpload
                            label="Upload video"
                            accept="video/*"
                            onUploaded={(file) =>
                              updateLesson(index, {
                                videoUrl: file.url,
                                videoKey: file.key ?? null,
                              })
                            }
                          />
                        )}
                      </div>
                      {lesson.videoKey && (
                        <p className="mt-1 truncate text-[9px] text-muted-foreground">
                          R2 key: {lesson.videoKey}
                        </p>
                      )}
                      <FieldError
                        message={
                          showErrors
                            ? validation.lessons[index]?.videoUrl
                            : undefined
                        }
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-[10px]">Lesson notes / description</Label>
                      <Textarea
                        value={lesson.description}
                        onChange={(event) =>
                          updateLesson(index, { description: event.target.value })
                        }
                        rows={2}
                        placeholder="Short lesson description shown below the video"
                        className="mt-1 rounded-lg bg-background text-xs"
                      />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-[10px] font-medium">
                      <input
                        type="checkbox"
                        checked={lesson.isPreview}
                        onChange={(event) =>
                          updateLesson(index, { isPreview: event.target.checked })
                        }
                        className="size-3.5 accent-[var(--primary)]"
                      />
                      Free preview lesson
                    </label>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px]">Attachments</Label>
                        <div className="flex gap-1.5">
                          <FileUpload
                            label="Upload attachment"
                            onUploaded={(file) =>
                              updateLesson(index, {
                                attachments: [
                                  ...lesson.attachments,
                                  {
                                    name: file.name,
                                    url: file.url,
                                    fileType: file.name.split(".").pop()?.toUpperCase(),
                                    fileSize: file.size,
                                  },
                                ],
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateLesson(index, {
                                attachments: [
                                  ...lesson.attachments,
                                  { name: "", url: "" },
                                ],
                              })
                            }
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <PlusIcon size={12} /> Add link
                          </button>
                        </div>
                      </div>
                      {lesson.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {lesson.attachments.map((file, fileIndex) => (
                            <div key={fileIndex} className="flex gap-1.5">
                              <Input
                                value={file.name}
                                placeholder="File name"
                                onChange={(event) => {
                                  const attachments = [...lesson.attachments];
                                  attachments[fileIndex] = {
                                    ...attachments[fileIndex],
                                    name: event.target.value,
                                  };
                                  updateLesson(index, { attachments });
                                }}
                                className="h-8 flex-[0.8] rounded-lg bg-background text-xs"
                              />
                              <Input
                                value={file.url}
                                placeholder="https://…"
                                onChange={(event) => {
                                  const attachments = [...lesson.attachments];
                                  attachments[fileIndex] = {
                                    ...attachments[fileIndex],
                                    url: event.target.value,
                                  };
                                  updateLesson(index, { attachments });
                                }}
                                className="h-8 flex-1 rounded-lg bg-background text-xs"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateLesson(index, {
                                    attachments: lesson.attachments.filter(
                                      (_, i) => i !== fileIndex,
                                    ),
                                  })
                                }
                                className="rounded p-1 text-destructive hover:bg-destructive/10"
                              >
                                <XIcon size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <FieldError
                        message={
                          showErrors
                            ? validation.lessons[index]?.attachments
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              {form.lessons.length === 0 && (
                <div
                  className={cn(
                    "rounded-lg border border-dashed py-10 text-center",
                    showErrors && validation.course.lessons
                      ? "border-destructive/50 bg-destructive/[0.03]"
                      : "border-border",
                  )}
                >
                  <VideoCameraIcon size={22} className="mx-auto text-muted-foreground" />
                  <p className="mt-2 text-[11px] font-medium">No lessons yet</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Add at least one lesson with a title, duration and video.
                  </p>
                  <FieldError
                    message={
                      showErrors ? validation.course.lessons : undefined
                    }
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    className="mt-3 h-8 rounded-lg px-3 text-[11px]"
                    onClick={addLesson}
                  >
                    <PlusIcon data-icon="inline-start" /> Add lesson
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Exam */}
          <section className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-sm font-semibold">
                  Final exam
                </h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Students unlock this only after completing every lesson.
                  {!form.certificateEnabled &&
                    " Certificate issuing is off, so students will not see this exam."}
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="h-8 rounded-lg px-2.5 text-[11px]"
                onClick={() => {
                  setQuestions((prev) => [
                    ...prev,
                    {
                      question: "",
                      options: ["", "", "", ""],
                      correctIndex: 0,
                      explanation: "",
                    },
                  ]);
                  setSaved(false);
                }}
              >
                <PlusIcon data-icon="inline-start" /> Add question
              </Button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-[10px]">
                  Pass mark (%) <RequiredMark />
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.examPassPercent}
                  aria-invalid={Boolean(
                    showErrors && validation.course.examPassPercent,
                  )}
                  onChange={(event) =>
                    setField("examPassPercent", Number(event.target.value))
                  }
                  className={cn(
                    "mt-1 h-8 rounded-lg bg-background text-xs",
                    showErrors &&
                      validation.course.examPassPercent &&
                      "border-destructive",
                  )}
                />
                <FieldError
                  message={
                    showErrors ? validation.course.examPassPercent : undefined
                  }
                />
              </div>
              <div>
                <Label className="text-[10px]">
                  Retry lock (hours) <RequiredMark />
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.examLockHours}
                  aria-invalid={Boolean(
                    showErrors && validation.course.examLockHours,
                  )}
                  onChange={(event) =>
                    setField("examLockHours", Number(event.target.value))
                  }
                  className={cn(
                    "mt-1 h-8 rounded-lg bg-background text-xs",
                    showErrors &&
                      validation.course.examLockHours &&
                      "border-destructive",
                  )}
                />
                <FieldError
                  message={
                    showErrors ? validation.course.examLockHours : undefined
                  }
                />
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-2 text-[10px] font-medium">
                <input
                  type="checkbox"
                  checked={form.certificateEnabled}
                  onChange={(event) =>
                    setField("certificateEnabled", event.target.checked)
                  }
                  className="size-3.5 accent-[var(--primary)]"
                />
                Issue certificate
              </label>
            </div>

            <div className="mt-4 space-y-3">
              {questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className={cn(
                    "rounded-lg border bg-muted/15 p-3",
                    showErrors && validation.questions[qIndex]
                      ? "border-destructive/40"
                      : "border-border",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-background text-[9px] font-semibold">
                      {qIndex + 1}
                    </span>
                    <Input
                      value={question.question}
                      placeholder="Question text"
                      aria-invalid={Boolean(
                        showErrors && validation.questions[qIndex]?.question,
                      )}
                      onChange={(event) => {
                        const next = [...questions];
                        next[qIndex] = {
                          ...next[qIndex],
                          question: event.target.value,
                        };
                        setQuestions(next);
                        setSaved(false);
                      }}
                      className={cn(
                        "h-8 flex-1 rounded-lg bg-background text-xs",
                        showErrors &&
                          validation.questions[qIndex]?.question &&
                          "border-destructive",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setQuestions((prev) =>
                          prev.filter((_, i) => i !== qIndex),
                        );
                        setSaved(false);
                      }}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {question.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-2 py-1.5",
                          question.correctIndex === oIndex
                            ? "border-emerald-600/40 bg-emerald-600/[0.06]"
                            : "border-border",
                        )}
                      >
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctIndex === oIndex}
                          onChange={() => {
                            const next = [...questions];
                            next[qIndex] = {
                              ...next[qIndex],
                              correctIndex: oIndex,
                            };
                            setQuestions(next);
                            setSaved(false);
                          }}
                          className="size-3 accent-emerald-600"
                        />
                        <input
                          value={option}
                          placeholder={`Option ${oIndex + 1}`}
                          onChange={(event) => {
                            const next = [...questions];
                            const options = [...next[qIndex].options];
                            options[oIndex] = event.target.value;
                            next[qIndex] = { ...next[qIndex], options };
                            setQuestions(next);
                            setSaved(false);
                          }}
                          className="h-6 w-full bg-transparent text-[11px] outline-none"
                        />
                      </label>
                    ))}
                  </div>
                  <FieldError
                    message={
                      showErrors
                        ? (validation.questions[qIndex]?.options ??
                          validation.questions[qIndex]?.correctIndex)
                        : undefined
                    }
                  />
                </div>
              ))}
              {questions.length === 0 && (
                <p
                  className={cn(
                    "rounded-lg border border-dashed px-3 py-5 text-center text-[10px]",
                    showErrors && validation.course.exam
                      ? "border-destructive/50 bg-destructive/[0.03] text-destructive"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {form.certificateEnabled
                    ? "At least one exam question is required because certificates are enabled. Add a question and select the correct option."
                    : "No exam questions yet. Add at least one question with the correct option selected."}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-background p-4">
            <h2 className="font-heading text-xs font-semibold">
              Ready to save?
            </h2>
            <ul className="mt-3 space-y-2">
              {checklist.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-2 text-[10px] leading-4"
                >
                  {item.ok ? (
                    <CheckCircleIcon
                      size={13}
                      weight="fill"
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  ) : (
                    <WarningCircleIcon
                      size={13}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                  )}
                  <span
                    className={
                      item.ok ? "text-muted-foreground" : "text-foreground"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            <p
              className={cn(
                "mt-3 border-t border-border pt-2 text-[10px] leading-4",
                validation.ok ? "text-emerald-700" : "text-muted-foreground",
              )}
            >
              {validation.ok
                ? "All required fields are complete."
                : `${validation.messages.length} required issue${
                    validation.messages.length === 1 ? "" : "s"
                  } remain. Click Save course to see them.`}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-background p-4">
            <h2 className="font-heading text-xs font-semibold">Pricing</h2>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] font-medium">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(event) => setField("isFree", event.target.checked)}
                className="size-3.5 accent-[var(--primary)]"
              />
              This is a free course
            </label>
            {!form.isFree && (
              <div className="mt-3">
                <Label className="text-[10px]">
                  Price (INR) <RequiredMark />
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={form.price}
                  aria-invalid={Boolean(showErrors && validation.course.price)}
                  onChange={(event) =>
                    setField("price", Number(event.target.value))
                  }
                  className={cn(
                    fieldClass,
                    showErrors &&
                      validation.course.price &&
                      "border-destructive",
                  )}
                />
                <FieldError
                  message={showErrors ? validation.course.price : undefined}
                />
              </div>
            )}
            <div className="mt-3">
              <Label className="text-[10px]">Thumbnail URL</Label>
              <Input
                value={form.thumbnail ?? ""}
                onChange={(event) => setField("thumbnail", event.target.value)}
                placeholder="https://…"
                className={fieldClass}
              />
              <FileUpload
                className="mt-2"
                label="Upload thumbnail"
                accept="image/*"
                onUploaded={(file) => setField("thumbnail", file.url)}
              />
              {form.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.thumbnail}
                  alt="Course thumbnail"
                  className="mt-2 aspect-video w-full rounded-lg border border-border object-cover"
                />
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-background p-4">
            <h2 className="font-heading text-xs font-semibold">
              Learning outcomes
            </h2>
            <Textarea
              value={form.outcomes.join("\n")}
              onChange={(event) =>
                setField(
                  "outcomes",
                  event.target.value.split("\n").filter(Boolean),
                )
              }
              rows={4}
              placeholder={"One outcome per line\nWrite clean Python\nBuild APIs"}
              className="mt-2 rounded-lg bg-background text-[11px]"
            />
          </section>

          <section className="rounded-xl border border-border bg-background p-4">
            <h2 className="font-heading text-xs font-semibold">Requirements</h2>
            <Textarea
              value={form.requirements.join("\n")}
              onChange={(event) =>
                setField(
                  "requirements",
                  event.target.value.split("\n").filter(Boolean),
                )
              }
              rows={3}
              placeholder="One requirement per line"
              className="mt-2 rounded-lg bg-background text-[11px]"
            />
          </section>

          <section className="rounded-xl border border-border bg-background p-4">
            <h2 className="font-heading text-xs font-semibold">Tags</h2>
            <Textarea
              value={form.tags.join("\n")}
              onChange={(event) =>
                setField("tags", event.target.value.split("\n").filter(Boolean))
              }
              rows={3}
              placeholder={"Python\nBackend\nAutomation"}
              className="mt-2 rounded-lg bg-background text-[11px]"
            />
          </section>

          <section className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
            <div className="flex items-start gap-2">
              <ImageIcon size={15} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-[11px] font-semibold">R2 uploads</p>
                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                  Uploads use a Cloudflare R2 binding named <code>BUCKET</code>.
                  Set <code>R2_PUBLIC_URL</code> to serve files from a public
                  bucket domain, or they stream through <code>/api/files</code>.
                </p>
              </div>
            </div>
          </section>

          <Button
            size="lg"
            className="h-10 w-full rounded-lg text-xs"
            onClick={submit}
            disabled={pending}
          >
            {pending ? "Saving…" : saved ? "All changes saved" : "Save course"}
            {saved ? <CheckIcon data-icon="inline-end" /> : <FloppyDiskIcon data-icon="inline-end" />}
          </Button>
          {!validation.ok && (
            <p className="text-center text-[10px] leading-4 text-muted-foreground">
              Missing required fields? Click save to highlight them.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
