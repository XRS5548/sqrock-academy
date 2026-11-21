import { notFound } from "next/navigation";
import { CourseEditor } from "@/components/admin/course-editor";
import { getCourseById, getExamWithAnswers } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) notFound();
  const exam = await getExamWithAnswers(course.id);

  return (
    <CourseEditor
      courseId={course.id}
      initial={{
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        slug: course.slug,
        description: course.description,
        category: course.category,
        level: course.level,
        language: course.language,
        price: course.price,
        isFree: course.isFree,
        status: course.status === "published" ? "published" : "draft",
        mode: course.mode,
        durationMinutes: course.durationMinutes,
        instructorName: course.instructorName,
        instructorRole: course.instructorRole,
        thumbnail: course.thumbnail,
        trailerUrl: null,
        outcomes: course.outcomes,
        requirements: course.requirements,
        tags: course.tags,
        certificateEnabled: course.certificateEnabled,
        certificateTemplateName: course.certificateTemplateName,
        certificateTemplateUrl: course.certificateTemplateUrl,
        certificateTemplateKey: course.certificateTemplateKey,
        certificatePlaceholders: course.certificatePlaceholders,
        examPassPercent: course.examPassPercent,
        examLockHours: course.examLockHours,
        lessons: course.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          videoType: lesson.videoType === "r2" ? "r2" : "youtube",
          videoUrl: lesson.videoUrl,
          videoKey: null,
          durationMinutes: lesson.durationMinutes,
          isPreview: lesson.isPreview,
          attachments: lesson.attachments.map((file) => ({
            name: file.name,
            url: file.url,
            fileType: file.fileType ?? undefined,
            fileSize: file.fileSize ?? undefined,
          })),
        })),
      }}
      initialQuestions={(exam?.questions ?? []).map((question) => ({
        question: question.question,
        options: question.options ?? [],
        correctIndex: question.correctIndex,
        explanation: question.explanation ?? "",
      }))}
    />
  );
}
