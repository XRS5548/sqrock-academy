import type { CourseInput } from "@/lib/actions";
import { normalizeVideoUrl } from "@/lib/video";

export type CourseFieldErrors = {
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  level?: string;
  language?: string;
  instructorName?: string;
  price?: string;
  durationMinutes?: string;
  lessons?: string;
  exam?: string;
  examPassPercent?: string;
  examLockHours?: string;
};

export type LessonFieldErrors = {
  title?: string;
  durationMinutes?: string;
  videoUrl?: string;
  attachments?: string;
};

export type QuestionFieldErrors = {
  question?: string;
  options?: string;
  correctIndex?: string;
};

export type QuestionInput = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type CourseValidation = {
  ok: boolean;
  course: CourseFieldErrors;
  lessons: Record<number, LessonFieldErrors>;
  questions: Record<number, QuestionFieldErrors>;
  messages: string[];
};

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isSafeUrl(value: string) {
  const url = value.trim();
  return /^https?:\/\/\S+$/i.test(url) || /^\/\S*$/.test(url);
}

export function validateCourse(
  input: CourseInput,
  questions: QuestionInput[],
  options: { requireExam?: boolean } = {},
): CourseValidation {
  const requireExam = options.requireExam ?? true;
  const course: CourseFieldErrors = {};
  const lessons: Record<number, LessonFieldErrors> = {};
  const questionErrors: Record<number, QuestionFieldErrors> = {};
  const messages: string[] = [];

  const push = (message: string) => messages.push(message);

  if (input.title.trim().length < 3) {
    course.title = "Title must be at least 3 characters.";
    push("Course title is required (minimum 3 characters).");
  }

  const slug = slugify(input.slug || input.title);
  if (!slug) {
    course.slug = "Add a slug or a title so one can be generated.";
    push("Course slug is required.");
  } else if (slug.length < 3) {
    course.slug = "Slug must be at least 3 characters.";
    push("Course slug is too short.");
  }

  if (!input.subtitle.trim()) {
    course.subtitle = "Add a short one-line subtitle.";
    push("Course subtitle is required.");
  }

  if (stripHtml(input.description).length < 20) {
    course.description =
      "Write at least a short paragraph (20+ characters) about the course.";
    push("Course description is required (minimum 20 characters).");
  }

  if (!input.category.trim()) {
    course.category = "Choose a category.";
    push("Course category is required.");
  }
  if (!input.level.trim()) {
    course.level = "Choose a level.";
    push("Course level is required.");
  }
  if (!input.language.trim()) {
    course.language = "Add the course language.";
    push("Course language is required.");
  }
  if (!input.instructorName.trim()) {
    course.instructorName = "Add the instructor name.";
    push("Instructor name is required.");
  }

  if (
    !input.isFree &&
    (!Number.isFinite(Number(input.price)) || Number(input.price) <= 0)
  ) {
    course.price = "Set a price greater than 0, or mark the course as free.";
    push("Paid courses need a price greater than 0.");
  }

  if (input.lessons.length === 0) {
    course.lessons = "Add at least one lesson.";
    push("Add at least one lesson to the course.");
  }

  input.lessons.forEach((lesson, index) => {
    const errors: LessonFieldErrors = {};
    const number = index + 1;

    if (!lesson.title.trim()) {
      errors.title = "Lesson title is required.";
      push(`Lesson ${number}: title is required.`);
    }

    if (
      !Number.isFinite(Number(lesson.durationMinutes)) ||
      Number(lesson.durationMinutes) <= 0
    ) {
      errors.durationMinutes = "Duration must be at least 1 minute.";
      push(`Lesson ${number}: duration must be at least 1 minute.`);
    }

    const videoUrl = lesson.videoUrl.trim();
    if (!videoUrl) {
      errors.videoUrl = "Video URL is required.";
      push(`Lesson ${number}: video URL is required.`);
    } else if (lesson.videoType === "youtube") {
      const video = normalizeVideoUrl(videoUrl, "youtube");
      if (!video || video.kind !== "youtube") {
        errors.videoUrl =
          "Enter a valid YouTube URL or an 11-character video ID.";
        push(`Lesson ${number}: enter a valid YouTube URL or video ID.`);
      }
    } else if (!isSafeUrl(videoUrl)) {
      errors.videoUrl = "Enter a valid video URL (https://… or an uploaded file).";
      push(`Lesson ${number}: enter a valid video URL.`);
    }

    const badAttachment = lesson.attachments.findIndex(
      (file) =>
        (file.name.trim() || file.url.trim()) &&
        (!file.name.trim() ||
          !file.url.trim() ||
          !isSafeUrl(file.url)),
    );
    if (badAttachment !== -1) {
      errors.attachments = `Attachment ${badAttachment + 1} needs both a name and a valid URL.`;
      push(
        `Lesson ${number}: attachment ${badAttachment + 1} needs a name and a valid URL.`,
      );
    }

    if (Object.keys(errors).length > 0) lessons[index] = errors;
  });

  const totalDuration = input.lessons.reduce(
    (sum, lesson) => sum + (Number(lesson.durationMinutes) || 0),
    0,
  );
  if (input.lessons.length > 0 && totalDuration <= 0) {
    course.durationMinutes =
      "Course duration is calculated from lessons. Add a duration to at least one lesson.";
    push("Course duration is required. Add durations to your lessons.");
  }

  if (
    !Number.isFinite(Number(input.examPassPercent)) ||
    Number(input.examPassPercent) < 1 ||
    Number(input.examPassPercent) > 100
  ) {
    course.examPassPercent = "Pass mark must be between 1 and 100.";
    push("Exam pass mark must be between 1% and 100%.");
  }

  if (
    !Number.isFinite(Number(input.examLockHours)) ||
    Number(input.examLockHours) < 0
  ) {
    course.examLockHours = "Retry lock must be 0 hours or more.";
    push("Exam retry lock must be 0 hours or more.");
  }

  const validateQuestions = requireExam
    ? input.certificateEnabled || questions.length > 0
    : false;

  if (requireExam && input.certificateEnabled && questions.length === 0) {
    course.exam =
      "Add at least one exam question, or turn off certificate issuing.";
    push("Add at least one exam question because certificates are enabled.");
  }

  if (validateQuestions) {
    questions.forEach((question, index) => {
      const errors: QuestionFieldErrors = {};
      const number = index + 1;
      const filledOptions = question.options.map((option) => option.trim());
      const hasContent =
        question.question.trim() || filledOptions.some(Boolean);

      if (!hasContent) {
        errors.question = "Add question text or remove this empty question.";
        push(`Question ${number}: add question text or remove it.`);
      }

      if (!question.question.trim()) {
        errors.question = "Question text is required.";
        push(`Question ${number}: question text is required.`);
      }

      if (filledOptions.filter(Boolean).length < 2) {
        errors.options = "Fill at least two answer options.";
        push(`Question ${number}: fill at least two answer options.`);
      }

      if (!filledOptions[question.correctIndex]?.trim()) {
        errors.correctIndex =
          "Select a correct option that has text, or fill the selected option.";
        push(
          `Question ${number}: select a correct answer that has text.`,
        );
      }

      if (Object.keys(errors).length > 0) questionErrors[index] = errors;
    });
  }

  return {
    ok: messages.length === 0,
    course,
    lessons,
    questions: questionErrors,
    messages,
  };
}
