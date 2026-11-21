export type AttachmentView = {
  id: string;
  lessonId: string | null;
  name: string;
  url: string;
  fileType: string | null;
  fileSize: number | null;
};

export type LessonView = {
  id: string;
  title: string;
  description: string;
  videoType: "youtube" | "r2" | string;
  videoUrl: string;
  durationMinutes: number;
  position: number;
  isPreview: boolean;
  attachments: AttachmentView[];
};

export type CourseMode = "live" | "recorded";

export type CourseView = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string;
  thumbnail: string | null;
  price: number;
  isFree: boolean;
  status: string;
  mode: CourseMode;
  durationMinutes: number;
  instructorName: string;
  instructorRole: string;
  instructorImage: string | null;
  certificateEnabled: boolean;
  certificateTemplateName: string | null;
  certificateTemplateUrl: string | null;
  certificateTemplateKey: string | null;
  certificatePlaceholders: string[];
  examPassPercent: number;
  examLockHours: number;
  outcomes: string[];
  requirements: string[];
  tags: string[];
  enrollments: number;
  rating: number;
  lessons: LessonView[];
};

export type JobView = {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  type: string;
  location: string;
  workMode: string;
  category: string;
  experience: string;
  salary: string | null;
  description: string;
  applyUrl: string | null;
  applyEmail: string | null;
  status: string;
  featured: boolean;
  createdAt: Date;
};

export type ExamQuestionView = {
  id: string;
  question: string;
  options: string[];
  position: number;
};

export type ExamView = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  passPercent: number;
  lockHours: number;
  timeLimitMinutes: number;
  questions: ExamQuestionView[];
};
