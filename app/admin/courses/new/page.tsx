import { CourseEditor } from "@/components/admin/course-editor";
import { requireAdmin } from "@/lib/session";

export default async function NewCoursePage() {
  await requireAdmin();
  return <CourseEditor />;
}
